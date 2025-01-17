import { shopifyFetch } from "./shopifyFetch";
import * as types from "./types";
import { parseCart, parseProduct, parseProducts, toNodeArray } from "./utils"
import { getProductQuery, getProductListQuery } from "./queries/product";
import { getCartQuery } from "./queries/cart";
import { addToCartMutation, createCartMutation, editCartItemsMutation, removeFromCartMutation } from "./mutations/cart";
import { getMenuQuery } from "./queries/menu";
import { getPageQuery, getPagesQuery } from "./queries/page";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { TAGS } from "../constants";
import { revalidateTag } from "next/cache";

// ---- PRODUCTS -----

export const getProductList = async ({
    query,
    reverse,
    sortKey,
}: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
}): Promise<types.Product[]> => {
    const res = await shopifyFetch<types.ShopifyProductsOperation>({
        query: getProductListQuery,
        variables: {
            query,
            reverse,
            sortKey,
        },
    });
    return parseProducts(res.body.data.products);
}

export const getProduct = async (handle: string): Promise<types.Product | undefined> => {
    const res = await shopifyFetch<types.ShopifyProductOperation>({
        query: getProductQuery,
        variables: {
            handle,
        },
        tags: [TAGS.products],
    });
    return parseProduct(res.body.data.product);
}

// ------ CART ------

export async function createCart(): Promise<types.Cart> {
    console.log("createCart")
    const res = await shopifyFetch<types.ShopifyCreateCartOperation>({
        query: createCartMutation,
        cache: "no-store",
    });

    return parseCart(res.body.data.cartCreate.cart);
}

export async function getCart(
    cartId: string | undefined
): Promise<types.Cart | undefined> {
    console.log("getCart", cartId)
    if (!cartId) return undefined;

    const res = await shopifyFetch<types.ShopifyCartOperation>({
        query: getCartQuery,
        variables: { cartId },
        tags: [TAGS.cart],
    });

    // old carts becomes 'null' when you checkout
    if (!res.body.data.cart) {
        console.log("no cart")
        return undefined;
    }

    console.log("parseCart")
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
    console.log("addTocart shopify call")
    const res = await shopifyFetch<types.ShopifyAddToCartOperation>({
        query: addToCartMutation,
        variables: {
            cartId,
            lines,
        },
        cache: "no-cache",
    });

    const cart = parseCart(res.body.data.cartLinesAdd.cart);
    console.log({ cart })
    return cart
}

// ------ MENU ------

export async function getMenu(handle: string): Promise<types.Menu[]> {
    const res = await shopifyFetch<types.ShopifyMenuOperation>({
        query: getMenuQuery,
        variables: {
            handle,
        },
    });

    return (
        res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
            title: item.title,
            path: item.url
        })) || []
    );
}

//  ------- PAGES -----

export async function getPage(handle: string): Promise<types.Page> {
    const res = await shopifyFetch<types.ShopifyPageOperation>({
        query: getPageQuery,
        cache: "no-store",
        variables: { handle },
    });

    return res.body.data.pageByHandle;
}

export async function getPages(): Promise<types.Page[]> {
    const res = await shopifyFetch<types.ShopifyPagesOperation>({
        query: getPagesQuery,
        cache: "no-store",
    });

    return toNodeArray(res.body.data.pages);
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
    // We always need to respond with a 200 status code to Shopify,
    // otherwise it will continue to retry the request.

    const productWebhooks = [
        "products/create",
        "products/delete",
        "products/update",
    ];
    const h = await headers()
    const topic = h.get("x-shopify-topic") || "unknown";
    const isProductUpdate = productWebhooks.includes(topic);

    if (!isProductUpdate) {
        // We don't need to revalidate anything for any other topics.
        return NextResponse.json({ status: 200 });
    }

    if (isProductUpdate) {
        revalidateTag(TAGS.products);
    }


    return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}