import { shopifyFetch } from "../shopifyFetch";
import * as types from "../types";
import { parseProduct, parseProducts } from "../utils"
import { getProductQuery, getProductListQuery } from "./product";

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
    });
    return parseProduct(res.body.data.product);
}