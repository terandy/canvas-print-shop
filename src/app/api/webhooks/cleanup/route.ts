import { NextRequest, NextResponse } from "next/server";
import { deleteImage } from "@/lib/s3/actions/image";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function verifyShopifyWebhook(request: NextRequest) {
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const body = request.body;
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body as any)
    .digest("base64");
  return hmac === hash;
}

function logToFile(data: any) {
  const logPath = path.join(process.cwd(), "webhook-logs.txt");
  const logEntry = `${new Date().toISOString()} - ${JSON.stringify(data)}\n`;
  fs.appendFileSync(logPath, logEntry);
}

export async function POST(request: NextRequest) {
  if (!verifyShopifyWebhook(request)) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  const topic = request.headers.get("x-shopify-topic");
  const body = await request.json();

  logToFile({
    event: "Webhook received",
    topic,
    headers: Object.fromEntries(request.headers),
    body,
  });

  switch (topic) {
    case "orders/fulfilled":
      // Delete image after successful fulfillment
      if (body.line_items) {
        for (const item of body.line_items) {
          const imageUrl = item.properties.find(
            (p: any) => p.name === "_Image URL"
          )?.value;
          if (imageUrl) await deleteImage(imageUrl);
        }
      }
      break;

    case "checkouts/delete":
      // Delete image when checkout is abandoned/cancelled
      if (body.line_items) {
        for (const item of body.line_items) {
          const imageUrl = item.properties.find(
            (p: any) => p.name === "_Image URL"
          )?.value;
          if (imageUrl) await deleteImage(imageUrl);
        }
      }
      break;

    case "carts/update":
      // Handle removed items from cart
      const removedItems = body.previous_line_items.filter(
        (prev: any) => !body.line_items.some((curr: any) => curr.id === prev.id)
      );
      for (const item of removedItems) {
        const imageUrl = item.properties.find(
          (p: any) => p.name === "_Image URL"
        )?.value;
        if (imageUrl) await deleteImage(imageUrl);
      }
      break;
  }

  return NextResponse.json({ status: "success" });
}
