"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { TAGS } from "../constants";
import * as cartDb from "@/lib/db/queries/carts";
import type { CartItemAttributes } from "@/types/cart";
import { checkoutErrorDetails } from "@/lib/stripe/errors";
import {
  createCheckoutSession,
  updateCheckoutShipping,
} from "@/lib/stripe/checkout";
import {
  normalizeCanadianPostalCode,
  normalizeCanadianRegion,
  postalCodeMatchesRegion,
} from "@/lib/shipping/pricing";

// Helper to validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

const optionalAddressField = z.string().max(200).nullable().optional();
const checkoutShippingUpdateSchema = z
  .object({
    checkoutSessionId: z
      .string()
      .min(8)
      .max(255)
      .regex(/^cs_[A-Za-z0-9_]+$/),
    shippingDetails: z
      .object({
        name: z.string().trim().min(1).max(200),
        address: z
          .object({
            country: z.string().length(2),
            line1: optionalAddressField,
            line2: optionalAddressField,
            city: optionalAddressField,
            postal_code: optionalAddressField,
            state: optionalAddressField,
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

export type CheckoutActionErrorCode =
  | "invalid-cart"
  | "empty-cart"
  | "invalid-address"
  | "checkout-unavailable";

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

  // Validate cart ID and create new cart if invalid or missing from DB
  if (!cartId || !isValidUUID(cartId)) {
    const newCart = await cartDb.createCart();
    cookieStore.set("cartId", newCart.id);
    cartId = newCart.id;
  } else {
    const existingCart = await cartDb.getCart(cartId);
    if (!existingCart) {
      const newCart = await cartDb.createCart();
      cookieStore.set("cartId", newCart.id);
      cartId = newCart.id;
    }
  }

  if (!payload.selectedVariantId) {
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

  if (!cartId || !isValidUUID(cartId)) {
    return "Invalid cart ID";
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

  if (!cartId || !isValidUUID(cartId)) {
    return "Invalid cart ID";
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

// Validate before the browser opens a fresh payment document. A client-router
// transition can retain stale Stripe iframe/controller state from the shop.
export const getCheckoutDestination = async (): Promise<
  { ok: true; url: string } | { ok: false }
> => {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;
  const locale = await getLocale();

  if (!cartId || !isValidUUID(cartId)) {
    return { ok: false };
  }

  const cart = await cartDb.getCart(cartId);

  if (!cart || cart.items.length === 0) {
    return { ok: false };
  }

  return { ok: true, url: `/${locale === "fr" ? "fr" : "en"}/checkout` };
};

/** Create Stripe state only from a POST-backed Server Action, never from the
 * checkout page's GET render (which Next.js may prefetch or retry). */
export async function createEmbeddedCheckoutSession(): Promise<
  | { ok: true; clientSecret: string }
  | { ok: false; code: CheckoutActionErrorCode }
> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const locale = (await getLocale()) === "fr" ? "fr" : "en";

  if (!cartId || !isValidUUID(cartId)) {
    return { ok: false, code: "invalid-cart" };
  }

  const cart = await cartDb.getCart(cartId);
  if (!cart || cart.items.length === 0) {
    return { ok: false, code: "empty-cart" };
  }

  try {
    const session = await createCheckoutSession(cartId, locale);
    if (!session.client_secret) {
      return { ok: false, code: "checkout-unavailable" };
    }
    return { ok: true, clientSecret: session.client_secret };
  } catch (error) {
    console.error(
      "Unable to create Checkout Form Session",
      checkoutErrorDetails(error)
    );
    return { ok: false, code: "checkout-unavailable" };
  }
}

export async function updateEmbeddedCheckoutShipping(
  input: unknown
): Promise<
  | { ok: true; automaticDelivery: boolean }
  | { ok: false; code: CheckoutActionErrorCode }
> {
  const parsed = checkoutShippingUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid-address" };
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  if (!cartId || !isValidUUID(cartId)) {
    return { ok: false, code: "invalid-cart" };
  }

  const { checkoutSessionId, shippingDetails } = parsed.data;
  const country = shippingDetails.address.country.toUpperCase();
  const line1 = shippingDetails.address.line1?.trim();
  const city = shippingDetails.address.city?.trim();
  const province = normalizeCanadianRegion(shippingDetails.address.state);
  const postalCode = normalizeCanadianPostalCode(
    shippingDetails.address.postal_code
  );

  if (
    country !== "CA" ||
    !line1 ||
    !city ||
    !province ||
    !postalCode ||
    !postalCodeMatchesRegion(postalCode, province)
  ) {
    return { ok: false, code: "invalid-address" };
  }

  try {
    const result = await updateCheckoutShipping({
      sessionId: checkoutSessionId,
      cartId,
      shippingDetails: {
        name: shippingDetails.name.trim(),
        address: {
          country: "CA",
          line1,
          ...(shippingDetails.address.line2?.trim()
            ? { line2: shippingDetails.address.line2.trim() }
            : {}),
          city,
          postal_code: postalCode,
          state: province,
        },
      },
    });
    return { ok: true, ...result };
  } catch (error) {
    console.error(
      "Unable to update Checkout shipping",
      checkoutErrorDetails(error)
    );
    return { ok: false, code: "checkout-unavailable" };
  }
}

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

  if (!cartId || !isValidUUID(cartId)) {
    return undefined;
  }

  return cartDb.getCart(cartId);
};

// Clear all items from cart
export const clearCartAction = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId || !isValidUUID(cartId)) {
    return;
  }

  await cartDb.clearCart(cartId);
  revalidateTag(TAGS.cart);
};
