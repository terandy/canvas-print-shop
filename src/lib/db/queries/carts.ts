import { eq, and, sql } from "drizzle-orm";
import { db } from "../index";
import { carts, cartItems, productVariants, products } from "../schema";
import type { Cart, CartItem, CartItemAttributes } from "@/types/cart";
import type { Money } from "@/types/common";

// Helper to validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Helper to format cents to Money
function formatMoney(cents: number, currency = "CAD"): Money {
  return {
    amount: (cents / 100).toFixed(2),
    currencyCode: currency,
  };
}

// Create a new cart
export async function createCart(): Promise<{ id: string }> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  const [cart] = await db
    .insert(carts)
    .values({
      status: "active",
      expiresAt,
    })
    .returning({ id: carts.id });

  return cart;
}

// Get cart by ID with all items
export async function getCart(cartId: string): Promise<Cart | undefined> {
  // Validate UUID format (handle old Shopify cart IDs gracefully)
  if (!isValidUUID(cartId)) {
    return undefined;
  }

  // Check if cart exists and is active
  const [cart] = await db
    .select()
    .from(carts)
    .where(and(eq(carts.id, cartId), eq(carts.status, "active")));

  if (!cart) return undefined;

  // Get cart items with variant and product info
  const items = await db
    .select({
      cartItem: cartItems,
      variant: productVariants,
      product: products,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  // Format cart items
  const formattedItems: CartItem[] = items.map((item) => ({
    id: item.cartItem.id,
    variantId: item.variant.id,
    productId: item.product.id,
    productHandle: item.product.handle,
    productTitle: item.product.titleEn,
    variantTitle: item.variant.title,
    quantity: item.cartItem.quantity,
    priceCents: item.variant.priceCents,
    selectedOptions: item.variant.options,
    attributes: item.cartItem.attributes as CartItemAttributes,
  }));

  // Calculate totals
  const subtotalCents = formattedItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );
  const taxCents = 0; // TODO: Calculate tax
  const totalCents = subtotalCents + taxCents;
  const totalQuantity = formattedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return {
    id: cart.id,
    items: formattedItems,
    totalQuantity,
    cost: {
      subtotalAmount: formatMoney(subtotalCents),
      taxAmount: formatMoney(taxCents),
      totalAmount: formatMoney(totalCents),
    },
  };
}

// Add item to cart
export async function addItemToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1,
  attributes: CartItemAttributes = {}
): Promise<Cart | undefined> {
  // Check if item already exists in cart
  const [existingItem] = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId))
    );

  if (existingItem) {
    // Check if attributes match (same image, etc.)
    const existingAttrs = existingItem.attributes as CartItemAttributes;
    const attrsMatch =
      existingAttrs.imageUrl === attributes.imageUrl &&
      existingAttrs.borderStyle === attributes.borderStyle &&
      existingAttrs.orientation === attributes.orientation;

    if (attrsMatch) {
      // Update quantity
      await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Different attributes = new line item
      await db.insert(cartItems).values({
        cartId,
        variantId,
        quantity,
        attributes,
      });
    }
  } else {
    // Insert new item
    await db.insert(cartItems).values({
      cartId,
      variantId,
      quantity,
      attributes,
    });
  }

  // Update cart timestamp
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cartId));

  return getCart(cartId);
}

// Update cart item (quantity and/or attributes)
export async function updateCartItem(
  cartId: string,
  cartItemId: string,
  variantId: string,
  quantity: number,
  attributes: CartItemAttributes
): Promise<Cart | undefined> {
  if (quantity <= 0) {
    // Remove item
    return removeCartItem(cartId, cartItemId);
  }

  await db
    .update(cartItems)
    .set({
      variantId,
      quantity,
      attributes,
      updatedAt: new Date(),
    })
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));

  // Update cart timestamp
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cartId));

  return getCart(cartId);
}

// Update cart item quantity only
export async function updateCartItemQuantity(
  cartId: string,
  cartItemId: string,
  quantity: number
): Promise<Cart | undefined> {
  if (quantity <= 0) {
    return removeCartItem(cartId, cartItemId);
  }

  await db
    .update(cartItems)
    .set({
      quantity,
      updatedAt: new Date(),
    })
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));

  // Update cart timestamp
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cartId));

  return getCart(cartId);
}

// Remove item from cart
export async function removeCartItem(
  cartId: string,
  cartItemId: string
): Promise<Cart | undefined> {
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));

  // Update cart timestamp
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cartId));

  return getCart(cartId);
}

// Mark cart as converted (after successful checkout)
export async function markCartAsConverted(cartId: string): Promise<void> {
  await db
    .update(carts)
    .set({
      status: "converted",
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId));
}

// Get cart items for order creation
export async function getCartItemsForOrder(cartId: string) {
  const items = await db
    .select({
      cartItem: cartItems,
      variant: productVariants,
      product: products,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  return items.map((item) => ({
    variantId: item.variant.id,
    productHandle: item.product.handle,
    productTitle: item.product.titleEn,
    variantTitle: item.variant.title,
    quantity: item.cartItem.quantity,
    priceCents: item.variant.priceCents,
    selectedOptions: item.variant.options,
    attributes: item.cartItem.attributes as CartItemAttributes,
  }));
}

// Clear all items from cart
export async function clearCart(cartId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

  // Update cart timestamp
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cartId));
}
