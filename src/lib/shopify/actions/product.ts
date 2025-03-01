"use server";

import { shopifyFetch } from "../shopifyFetch";
import * as types from "../types";
import { parseProduct, parseProducts } from "../utils";
import { getProductQuery, getProductListQuery } from "../queries/product";
import { TAGS } from "../../constants";
import { getLocale } from "next-intl/server";

export const getProductList = async ({
  query,
  reverse,
  sortKey,
  cache,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  cache?: RequestCache;
}): Promise<types.Product[]> => {
  const locale = await getLocale(); // Gets the active locale (e.g., 'fr')
  const languageCode = locale === "fr" ? "FR" : "EN"; // Adjust based on your setup
  const res = await shopifyFetch<types.ShopifyProductsOperation>({
    query: getProductListQuery(languageCode),
    variables: {
      query,
      reverse,
      sortKey,
    },
    cache,
  });
  return parseProducts(res.body.data.products);
};

export const getProduct = async (
  handle: string
): Promise<types.Product | undefined> => {
  const locale = await getLocale(); // Gets the active locale (e.g., 'fr')
  const languageCode = locale === "fr" ? "FR" : "EN"; // Adjust based on your setup

  const res = await shopifyFetch<types.ShopifyProductOperation>({
    query: getProductQuery(languageCode),
    variables: {
      handle,
    },
    tags: [TAGS.products],
  });
  return parseProduct(res.body.data.product);
};
