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
import { TAGS } from "../constants";

export async function addItem(
    prevState: any,
    payload: {
        selectedVariantId: string | undefined,
        imgURL?: string
    }
) {
    const cookieStore = await cookies()
    let cartId = cookieStore.get("cartId")?.value;

    if (!cartId || !payload.selectedVariantId || !payload.imgURL) {
        return "Error adding item to cart";
    }

    try {
        const res = await addToCart(cartId, [
            { merchandiseId: payload.selectedVariantId, quantity: 1, attributes: [{ key: "_IMAGE URL", value: payload.imgURL }] },
        ]);
    } catch (error) {
        return "Error adding item to cart";
    } finally {
        revalidateTag(TAGS.cart);
    }
}

export const updateCartItem = async (
    prevState: any,
    payload: {
        cartItemId: string,
        merchandiseId: string;
        quantity: number;
        attributes: { key: string, value: string }[]
    }
) => {
    const cookieStore = await cookies()
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

        const lineItem = cart.lines.find(
            (line) => line.id === cartItemId
        );

        if (lineItem && lineItem.id) {
            if (quantity === 0) {
                await removeFromCart(cartId, [lineItem.id]);
            } else {
                const cart = await updateCart(cartId, [
                    {
                        id: lineItem.id,
                        merchandiseId,
                        quantity,
                        attributes
                    },
                ]);
            }
        } else if (quantity > 0) {
            // If the item doesn't exist in the cart and quantity > 0, add it
            await addToCart(cartId, [{ merchandiseId, quantity, attributes }]);
        }

    } catch (error) {
        console.error(error);
        return "Error updating item quantity";
    } finally {
        revalidateTag(TAGS.cart)
    }
}

export const removeItem = async (prevState: any, cartItemId: string) => {
    const cookieStore = await cookies()
    let cartId = cookieStore.get("cartId")?.value;

    if (!cartId) {
        return "Missing cart ID";
    }

    try {
        const cart = await getCart(cartId);
        if (!cart) {
            return "Error fetching cart";
        }

        const lineItem = cart.lines.find(
            (line) => line.id === cartItemId
        );

        if (lineItem && lineItem.id) {
            await removeFromCart(cartId, [lineItem.id]);
        } else {
            return "Item not found in cart";
        }
    } catch (error) {
        return "Error removing item from cart";
    } finally {
        revalidateTag(TAGS.cart)
    }
}

export const redirectToCheckout = async () => {
    const cookieStore = await cookies()
    let cartId = cookieStore.get("cartId")?.value;

    if (!cartId) {
        return "Missing cart ID";
    }

    let cart = await getCart(cartId);

    if (!cart) {
        return "Error fetching cart";
    }

    redirect(cart.checkoutUrl);
}

export const createCartAndSetCookie = async () => {
    let cart = await createCart();
    const cookiesStore = await cookies()
    cookiesStore.set("cartId", cart.id!);
}
