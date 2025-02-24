"use server";

import { shopifyFetch } from "../shopifyFetch";
import * as types from "../types";
import { parseCart } from "../utils";
import {
  getCartQuery,
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
  getAbandonnedCartsQuery,
} from "../queries/cart";

import { TAGS } from "../../constants";

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
    tags: [TAGS.cart],
  });

  // old carts becomes 'null' when you checkout
  if (!res.body.data.cart) {
    return undefined;
  }

  return parseCart(res.body.data.cart);
}

export async function getAbandonnedCarts(): Promise<types.Cart[] | undefined> {
  const res = await shopifyFetch<types.ShopifyAbandonedCartOperation>({
    query: getAbandonnedCartsQuery,
    tags: [TAGS.cart],
  });

  // old carts becomes 'null' when you checkout
  if (!res.body.data.carts) {
    return undefined;
  }

  return res.body.data.carts.map((c) => parseCart(c));
}

export async function removeFromCart(
  variables: types.ShopifyRemoveFromCartOperation["variables"]
): Promise<types.Cart> {
  const res = await shopifyFetch<types.ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables,
    cache: "no-store",
  });

  return parseCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  variables: types.ShopifyUpdateCartOperation["variables"]
): Promise<types.Cart> {
  const res = await shopifyFetch<types.ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables,
    cache: "no-store",
  });

  return parseCart(res.body.data.cartLinesUpdate.cart);
}

export async function addToCart(
  variables: types.ShopifyAddToCartOperation["variables"]
): Promise<types.Cart> {
  const res = await shopifyFetch<types.ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables,
    cache: "no-cache",
  });

  const cart = parseCart(res.body.data.cartLinesAdd.cart);
  return cart;
}
