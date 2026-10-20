"use server";

import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import {
  cartIdSchema,
  recoveryEmailSchema,
  recoveryBlock,
  recoveryFingerprint,
  createRecoveryToken,
  type RecoveryBlock,
} from "@/lib/cart-recovery/shared";
import {
  saveRecoveryContact,
  getRecoveryCart,
  claimRecoverySend,
  recordRecoverySent,
} from "@/lib/db/queries/cart-recovery";
import { renderCartRecoveryEmail } from "@/lib/email/cart-recovery";
import { resend, ORDER_EMAIL } from "@/lib/email";
import { BASE_URL } from "@/lib/constants";
import { BUSINESS_DATA } from "@/lib/business-data";

export type SaveRecoveryState = {
  status?: "saved" | "invalid" | "unavailable";
};

export async function saveCartRecoveryEmail(
  _previous: SaveRecoveryState,
  form: FormData
): Promise<SaveRecoveryState> {
  const email = recoveryEmailSchema.safeParse(form.get("email"));
  const cartId = (await cookies()).get("cartId")?.value;
  if (!email.success || form.get("consent") !== "on")
    return { status: "invalid" };
  if (!cartIdSchema.safeParse(cartId).success) return { status: "unavailable" };
  try {
    const locale = (await getLocale()) === "fr" ? "fr" : "en";
    return {
      status: (await saveRecoveryContact(cartId!, email.data, locale))
        ? "saved"
        : "unavailable",
    };
  } catch {
    console.error("Unable to save cart recovery contact");
    return { status: "unavailable" };
  }
}

export type SendRecoveryState = {
  status?:
    | "sent"
    | "unauthorized"
    | "changed"
    | "notConfigured"
    | "sendFailed"
    | "unconfirmed"
    | RecoveryBlock;
};

export async function sendCartRecoveryEmail(
  _previous: SendRecoveryState,
  form: FormData
): Promise<SendRecoveryState> {
  const admin = await getAdminSession();
  if (!admin || !["admin", "super_admin"].includes(admin.role))
    return { status: "unauthorized" };
  const parsedId = cartIdSchema.safeParse(form.get("cartId"));
  if (!parsedId.success) return { status: "unavailable" };
  if (!resend || !ORDER_EMAIL) return { status: "notConfigured" };
  let claimed = false;
  try {
    const cart = await getRecoveryCart(parsedId.data);
    if (!cart) return { status: "unavailable" };
    const blocked = recoveryBlock(cart);
    if (blocked) return { status: blocked };
    if (form.get("fingerprint") !== recoveryFingerprint(cart))
      return { status: "changed" };

    const recovery = createRecoveryToken();
    const unsubscribe = createRecoveryToken();
    const link = await claimRecoverySend(
      cart,
      admin.userId,
      recovery.tokenHash,
      unsubscribe.tokenHash
    );
    if (!link) return { status: "changed" };
    claimed = true;
    const email = renderCartRecoveryEmail(
      cart,
      `${BASE_URL}/api/cart-recovery?token=${recovery.token}`,
      `${BASE_URL}/api/cart-recovery/unsubscribe?token=${unsubscribe.token}`
    );
    const result = await resend.emails.send(
      {
        from: ORDER_EMAIL,
        to: link.email,
        replyTo: BUSINESS_DATA.organization.email,
        ...email,
      },
      { idempotencyKey: `cart-recovery/${link.id}` }
    );
    if (result.error || !result.data?.id) return { status: "sendFailed" };
    await recordRecoverySent(link.id, result.data.id);
    revalidatePath("/[locale]/admin/carts", "page");
    revalidatePath("/[locale]/admin/carts/[id]", "page");
    return { status: "sent" };
  } catch {
    // After claiming, a network failure may follow provider acceptance.
    // Keep the 24-hour claim; never automatically retry an ambiguous send.
    console.error("Cart recovery email could not be confirmed");
    return { status: claimed ? "unconfirmed" : "unavailable" };
  }
}
