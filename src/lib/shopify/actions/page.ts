"use server";

import { getPageQuery, getPagesQuery } from "../queries/page";
import { shopifyFetch } from "../shopifyFetch";
import { toNodeArray } from "../utils";
import * as types from "../types";

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