"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { TAGS } from "../constants";
import * as cartDb from "@/lib/db/queries/carts";
import type { CartItemAttributes } from "@/types/cart";
import { createCheckoutSession } from "@/lib/stripe/checkout";

// Attribute format from Shopify (for backwards compatibility during transition)
type Attribute = {
  key: string;
  value: string;
};

// Payload types (backwards compatible with existing components)
export type AddToCartPayload = {
  selectedVariantId: string | undefined;
  attributes: Attribute[];
};

export type UpdateCartItemPayload = {
  cartItemId: string;
  merchandiseId: string;
  quantity: number;
  attributes: Attribute[];
};

// Convert Shopify-style attributes to our CartItemAttributes
function parseAttributes(attributes: Attribute[]): CartItemAttributes {
  const result: CartItemAttributes = {};

  for (const attr of attributes) {
    switch (attr.key) {
      case "imgURL":
      case "imageUrl":
        result.imageUrl = attr.value;
        break;
      case "borderStyle":
        result.borderStyle = attr.value;
        break;
      case "direction":
      case "orientation":
        result.orientation = attr.value as "landscape" | "portrait";
        break;
    }
  }

  return result;
}

// Add item to cart
export async function addItem(_prevState: any, payload: AddToCartPayload) {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;

  if (!cartId || !payload.selectedVariantId) {
    console.error("Failed to call cart action addItem. Missing variable", {
      cartId,
      payload,
    });
    return "Error adding item to cart";
  }

  try {
    const attributes = parseAttributes(payload.attributes);
    const cart = await cartDb.addItemToCart(
      cartId,
      payload.selectedVariantId,
      1,
      attributes
    );
    return cart;
  } catch (error) {
    console.error(error);
    return "Error adding item to cart";
  } finally {
    revalidateTag(TAGS.cart);
  }
}

// Update cart item
export const updateCartItem = async (
  _prevState: any,
  payload: UpdateCartItemPayload
) => {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    return "Missing cart ID";
  }

  const { cartItemId, merchandiseId, quantity, attributes } = payload;

  try {
    const parsedAttributes = parseAttributes(attributes);

    if (quantity === 0) {
      await cartDb.removeCartItem(cartId, cartItemId);
    } else {
      await cartDb.updateCartItem(
        cartId,
        cartItemId,
        merchandiseId,
        quantity,
        parsedAttributes
      );
    }
  } catch (error) {
    console.error(error);
    return "Error updating item quantity";
  } finally {
    revalidateTag(TAGS.cart);
  }
};

// Remove item from cart
export const removeItem = async (_prevState: any, cartItemId: string) => {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    return "Missing cart ID";
  }

  try {
    await cartDb.removeCartItem(cartId, cartItemId);
  } catch (error) {
    console.error(error);
    return "Error removing item from cart";
  } finally {
    revalidateTag(TAGS.cart);
  }
};

// Redirect to Stripe checkout
export const redirectToCheckout = async () => {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;
  const locale = await getLocale();

  if (!cartId) {
    return "Missing cart ID";
  }

  const cart = await cartDb.getCart(cartId);

  if (!cart || cart.items.length === 0) {
    return "Cart is empty";
  }

  let checkoutUrl: string;

  try {
    const session = await createCheckoutSession(cartId, locale);
    checkoutUrl = session.url!;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return "Error creating checkout session";
  }

  // redirect() must be called outside try-catch as it throws a special error
  redirect(checkoutUrl);
};

// Create cart and set cookie
export const createCartAndSetCookie = async () => {
  const cart = await cartDb.createCart();
  const cookiesStore = await cookies();
  cookiesStore.set("cartId", cart.id);
};

// Get cart (for server components)
export const getCart = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    return undefined;
  }

  return cartDb.getCart(cartId);
};

// Clear all items from cart
export const clearCartAction = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    return;
  }

  await cartDb.clearCart(cartId);
  revalidateTag(TAGS.cart);
};
