"use server";

import { TAGS } from "@/lib/constants";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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