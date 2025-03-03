"use server";

import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "@/lib/shopify";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BASE_URL, TAGS } from "../constants";
import type {
  UpdateCartItemOperation,
  AddToCartOperation,
} from "../shopify/types";
import { getLocale } from "next-intl/server";

export async function addItem(prevState: any, payload: AddToCartOperation) {
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
    const res = await addToCart({
      cartId,
      lines: [
        {
          merchandiseId: payload.selectedVariantId,
          quantity: 1,
          attributes: payload.attributes,
        },
      ],
    });
    return res;
  } catch (error) {
    console.error(error);
    return "Error adding item to cart";
  } finally {
    revalidateTag(TAGS.cart);
  }
}

export const updateCartItem = async (
  prevState: any,
  payload: UpdateCartItemOperation
) => {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;
  if (!cartId) {
    return "Missing cart ID";
  }

  const { cartItemId, merchandiseId, quantity, attributes } = payload;

  try {
    const cart = await getCart(cartId);
    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find((line) => line.id === cartItemId);

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart({ cartId, lineIds: [lineItem.id] });
      } else {
        await updateCart({
          cartId,
          lines: [
            {
              id: lineItem.id,
              merchandiseId,
              quantity,
              attributes,
            },
          ],
        });
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart({
        cartId,
        lines: [{ merchandiseId, quantity, attributes }],
      });
    }
  } catch (error) {
    console.error(error);
    return "Error updating item quantity";
  } finally {
    revalidateTag(TAGS.cart);
  }
};

export const removeItem = async (prevState: any, cartItemId: string) => {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    return "Missing cart ID";
  }

  try {
    const cart = await getCart(cartId);
    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find((line) => line.id === cartItemId);

    if (lineItem && lineItem.id) {
      await removeFromCart({ cartId, lineIds: [lineItem.id] });
    } else {
      return "Item not found in cart";
    }
  } catch (error) {
    return "Error removing item from cart";
  } finally {
    revalidateTag(TAGS.cart);
  }
};

export const redirectToCheckout = async () => {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;
  const locale = await getLocale();

  if (!cartId) {
    return "Missing cart ID";
  }

  let cart = await getCart(cartId);

  if (!cart) {
    return "Error fetching cart";
  }

  const localeParam = `locale=${locale}`;
  const returnToParam = `return_to=${encodeURIComponent(`${BASE_URL}/${locale}`)}`;
  const checkoutUrlWithLocale = cart.checkoutUrl.includes("?")
    ? `${cart.checkoutUrl}&${localeParam}&${returnToParam}`
    : `${cart.checkoutUrl}?${localeParam}&${returnToParam}`;

  redirect(checkoutUrlWithLocale);
};

export const createCartAndSetCookie = async () => {
  let cart = await createCart();
  const cookiesStore = await cookies();
  cookiesStore.set("cartId", cart.id!);
};
