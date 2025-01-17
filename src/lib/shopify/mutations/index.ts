import { getCartQuery } from "../queries/cart";
import { shopifyFetch } from "../shopifyFetch";
import * as types from "../types";
import { parseCart } from "../utils";
import { addToCartMutation, createCartMutation, editCartItemsMutation, removeFromCartMutation } from "./cart";

export async function createCart(): Promise<types.Cart> {
    const res = await shopifyFetch<types.ShopifyCreateCartOperation>({
        query: createCartMutation,
        cache: "no-store",
    });

    return parseCart(res.body.data.cartCreate.cart);
}

export async function getCart(
    cartId: string | undefined
): Promise<types.Cart | undefined> {
    if (!cartId) return undefined;

    const res = await shopifyFetch<types.ShopifyCartOperation>({
        query: getCartQuery,
        variables: { cartId },
    });

    // old carts becomes 'null' when you checkout
    if (!res.body.data.cart) {
        return undefined;
    }

    return parseCart(res.body.data.cart);
}

export async function removeFromCart(
    cartId: string,
    lineIds: string[]
): Promise<types.Cart> {
    const res = await shopifyFetch<types.ShopifyRemoveFromCartOperation>({
        query: removeFromCartMutation,
        variables: {
            cartId,
            lineIds,
        },
        cache: "no-store",
    });

    return parseCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
    cartId: string,
    lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<types.Cart> {
    const res = await shopifyFetch<types.ShopifyUpdateCartOperation>({
        query: editCartItemsMutation,
        variables: {
            cartId,
            lines,
        },
        cache: "no-store",
    });

    return parseCart(res.body.data.cartLinesUpdate.cart);
}

export async function addToCart(
    cartId: string,
    lines: { merchandiseId: string; quantity: number }[]
): Promise<types.Cart> {
    const res = await shopifyFetch<types.ShopifyAddToCartOperation>({
        query: addToCartMutation,
        variables: {
            cartId,
            lines,
        },
        cache: "no-cache",
    });

    return parseCart(res.body.data.cartLinesAdd.cart);
}