import {
  and,
  eq,
  exists,
  gt,
  lte,
  notExists,
  or,
  isNull,
  sql,
} from "drizzle-orm";
import { db } from "../index";
import {
  carts,
  cartItems,
  products,
  productVariants,
  orders,
  cartRecoveryContacts,
  cartRecoverySuppressions,
  cartRecoveryLinks,
} from "../schema";
import {
  RECOVERY_COOLDOWN_MS,
  RECOVERY_IDLE_MS,
  RECOVERY_LINK_MS,
  hashRecoveryToken,
  recoveryTokenSchema,
  cartIdSchema,
  type RecoveryCart,
} from "@/lib/cart-recovery/shared";

export async function getRecoveryCart(
  cartId: string
): Promise<RecoveryCart | null> {
  if (!cartIdSchema.safeParse(cartId).success) return null;
  const [row] = await db
    .select({
      id: carts.id,
      status: carts.status,
      updatedAt: carts.updatedAt,
      expiresAt: carts.expiresAt,
      contact: cartRecoveryContacts,
      suppressedEmail: cartRecoverySuppressions.email,
      hasOrder: exists(
        db
          .select({ id: orders.id })
          .from(orders)
          .where(eq(orders.cartId, carts.id))
      ).as("has_order"),
    })
    .from(carts)
    .leftJoin(cartRecoveryContacts, eq(cartRecoveryContacts.cartId, carts.id))
    .leftJoin(
      cartRecoverySuppressions,
      eq(cartRecoverySuppressions.email, cartRecoveryContacts.email)
    )
    .where(eq(carts.id, cartId));
  if (!row) return null;
  const items = await db
    .select({
      id: cartItems.id,
      productTitle: products.titleEn,
      productTitleFr: products.titleFr,
      variantTitle: productVariants.title,
      quantity: cartItems.quantity,
      priceCents: productVariants.priceCents,
      available: sql<boolean>`coalesce(${products.isActive} AND ${productVariants.availableForSale}, false)`,
      attributes: cartItems.attributes,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(cartItems.id);
  return {
    ...row,
    items,
    hasOrder: Boolean(row.hasOrder),
    contact: row.contact
      ? { ...row.contact, suppressed: !!row.suppressedEmail }
      : null,
  };
}

export async function saveRecoveryContact(
  cartId: string,
  email: string,
  locale: "en" | "fr"
) {
  const cart = await getRecoveryCart(cartId);
  if (
    !cart ||
    cart.status !== "active" ||
    cart.hasOrder ||
    !cart.items.length ||
    (cart.expiresAt && cart.expiresAt <= new Date())
  )
    return false;
  await db
    .insert(cartRecoveryContacts)
    .values({ cartId, email, locale, consentedAt: new Date() })
    .onConflictDoUpdate({
      target: cartRecoveryContacts.cartId,
      set: { email, locale, consentedAt: new Date() },
    });
  // Recording an address is activity, never evidence that the cart is abandoned.
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cartId));
  return true;
}

export async function claimRecoverySend(
  cart: RecoveryCart,
  sentBy: string,
  tokenHash: string,
  unsubscribeTokenHash: string
) {
  if (!cart.contact) return null;
  const now = new Date();
  return db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(cartRecoveryContacts)
      .set({ lastAttemptAt: now })
      .where(
        and(
          eq(cartRecoveryContacts.cartId, cart.id),
          eq(cartRecoveryContacts.email, cart.contact!.email),
          eq(cartRecoveryContacts.consentedAt, cart.contact!.consentedAt),
          or(
            isNull(cartRecoveryContacts.lastAttemptAt),
            lte(
              cartRecoveryContacts.lastAttemptAt,
              new Date(now.getTime() - RECOVERY_COOLDOWN_MS)
            )
          ),
          notExists(
            tx
              .select({ email: cartRecoverySuppressions.email })
              .from(cartRecoverySuppressions)
              .where(
                eq(cartRecoverySuppressions.email, cartRecoveryContacts.email)
              )
          ),
          exists(
            tx
              .select({ id: carts.id })
              .from(carts)
              .where(
                and(
                  eq(carts.id, cart.id),
                  eq(carts.status, "active"),
                  eq(carts.updatedAt, cart.updatedAt!),
                  lte(
                    carts.updatedAt,
                    new Date(now.getTime() - RECOVERY_IDLE_MS)
                  ),
                  or(isNull(carts.expiresAt), gt(carts.expiresAt, now))
                )
              )
          ),
          notExists(
            tx
              .select({ id: orders.id })
              .from(orders)
              .where(eq(orders.cartId, cart.id))
          )
        )
      )
      .returning({ cartId: cartRecoveryContacts.cartId });
    if (!claimed) return null;
    const [link] = await tx
      .insert(cartRecoveryLinks)
      .values({
        cartId: cart.id,
        email: cart.contact!.email,
        locale: cart.contact!.locale,
        sentBy,
        tokenHash,
        unsubscribeTokenHash,
        expiresAt: new Date(now.getTime() + RECOVERY_LINK_MS),
      })
      .returning();
    return link;
  });
}

export async function recordRecoverySent(linkId: string, providerId: string) {
  await db.transaction(async (tx) => {
    const [link] = await tx
      .update(cartRecoveryLinks)
      .set({ sentAt: new Date(), providerId })
      .where(eq(cartRecoveryLinks.id, linkId))
      .returning();
    if (link)
      await tx
        .update(cartRecoveryContacts)
        .set({ lastSentAt: link.sentAt })
        .where(
          and(
            eq(cartRecoveryContacts.cartId, link.cartId),
            eq(cartRecoveryContacts.email, link.email)
          )
        );
  });
}

export async function getRecoveryLink(token: string) {
  if (!recoveryTokenSchema.safeParse(token).success) return null;
  const [link] = await db
    .select()
    .from(cartRecoveryLinks)
    .where(
      and(
        eq(cartRecoveryLinks.tokenHash, hashRecoveryToken(token)),
        gt(cartRecoveryLinks.expiresAt, new Date())
      )
    );
  if (!link) return null;
  const cart = await getRecoveryCart(link.cartId);
  if (
    !cart ||
    cart.status !== "active" ||
    cart.hasOrder ||
    !cart.items.length ||
    cart.items.some((item) => !item.available) ||
    (cart.expiresAt && cart.expiresAt <= new Date()) ||
    !cart.contact ||
    cart.contact.email !== link.email ||
    cart.contact.suppressed
  )
    return null;
  return { cart, link };
}

// Opt-out tokens have a separate purpose and continue working after checkout
// links expire. They cannot be exchanged for access to a cart.
export async function getUnsubscribeLink(token: string) {
  if (!recoveryTokenSchema.safeParse(token).success) return null;
  const [link] = await db
    .select({
      email: cartRecoveryLinks.email,
      locale: cartRecoveryLinks.locale,
    })
    .from(cartRecoveryLinks)
    .where(
      eq(cartRecoveryLinks.unsubscribeTokenHash, hashRecoveryToken(token))
    );
  return link ?? null;
}

export async function unsubscribeRecovery(token: string) {
  const link = await getUnsubscribeLink(token);
  if (!link) return null;
  await db
    .insert(cartRecoverySuppressions)
    .values({ email: link.email })
    .onConflictDoNothing();
  return link;
}
