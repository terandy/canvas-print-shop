"use server";

import { getMenuQuery } from "../queries/menu";
import { shopifyFetch } from "../shopifyFetch";
import * as types from "../types";

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