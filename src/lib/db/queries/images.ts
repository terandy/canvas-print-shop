import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  orderItems,
  cartItems,
  products,
  productImages,
  orders,
  carts,
} from "../schema";

export type ImageAssociation =
  | { type: "order"; orderId: string; orderNumber: number }
  | { type: "cart"; cartId: string; cartStatus: string }
  | { type: "product"; productId: string; productTitle: string };

export async function getImageAssociations(): Promise<
  Map<string, ImageAssociation[]>
> {
  const associations = new Map<string, ImageAssociation[]>();

  function addAssociation(url: string, assoc: ImageAssociation) {
    const existing = associations.get(url) || [];
    existing.push(assoc);
    associations.set(url, existing);
  }

  // 1. Order items with imageUrl in JSONB attributes
  const orderItemRows = await db
    .select({
      attributes: orderItems.attributes,
      orderId: orderItems.orderId,
      orderNumber: orders.orderNumber,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id));

  for (const row of orderItemRows) {
    const attrs = row.attributes as { imageUrl?: string };
    if (attrs?.imageUrl) {
      addAssociation(attrs.imageUrl, {
        type: "order",
        orderId: row.orderId,
        orderNumber: row.orderNumber,
      });
    }
  }

  // 2. Cart items with imageUrl in JSONB attributes
  const cartItemRows = await db
    .select({
      attributes: cartItems.attributes,
      cartId: cartItems.cartId,
      cartStatus: carts.status,
    })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id));

  for (const row of cartItemRows) {
    const attrs = row.attributes as { imageUrl?: string };
    if (attrs?.imageUrl) {
      addAssociation(attrs.imageUrl, {
        type: "cart",
        cartId: row.cartId,
        cartStatus: row.cartStatus || "active",
      });
    }
  }

  // 3. Product featured images
  const productRows = await db
    .select({
      id: products.id,
      titleEn: products.titleEn,
      featuredImageUrl: products.featuredImageUrl,
    })
    .from(products);

  for (const row of productRows) {
    if (row.featuredImageUrl) {
      addAssociation(row.featuredImageUrl, {
        type: "product",
        productId: row.id,
        productTitle: row.titleEn,
      });
    }
  }

  // 4. Product gallery images
  const productImageRows = await db
    .select({
      url: productImages.url,
      productId: productImages.productId,
    })
    .from(productImages);

  const productMap = new Map(productRows.map((p) => [p.id, p.titleEn]));

  for (const row of productImageRows) {
    addAssociation(row.url, {
      type: "product",
      productId: row.productId,
      productTitle: productMap.get(row.productId) || "Unknown",
    });
  }

  return associations;
}
