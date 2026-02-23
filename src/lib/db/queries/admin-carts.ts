import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "../index";
import {
  carts,
  cartItems,
  productVariants,
  products,
  customers,
} from "../schema";

export interface AdminCartItem {
  productTitle: string;
  variantTitle: string;
  quantity: number;
  priceCents: number;
  imageUrl: string | null;
}

export interface AdminCart {
  id: string;
  customerEmail: string | null;
  customerName: string | null;
  items: AdminCartItem[];
  itemCount: number;
  totalCents: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export async function getActiveCarts(): Promise<AdminCart[]> {
  // Get all active carts
  const cartRows = await db
    .select({
      id: carts.id,
      customerEmail: customers.email,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      createdAt: carts.createdAt,
      updatedAt: carts.updatedAt,
    })
    .from(carts)
    .leftJoin(customers, eq(carts.customerId, customers.id))
    .where(eq(carts.status, "active"))
    .orderBy(desc(carts.updatedAt));

  // For each cart, fetch items
  const result: AdminCart[] = [];

  for (const cart of cartRows) {
    const items = await db
      .select({
        productTitle: products.titleEn,
        variantTitle: productVariants.title,
        quantity: cartItems.quantity,
        priceCents: productVariants.priceCents,
        attributes: cartItems.attributes,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    // Skip empty carts
    if (items.length === 0) continue;

    const formattedItems: AdminCartItem[] = items.map((item) => {
      const attrs = item.attributes as { imageUrl?: string };
      return {
        productTitle: item.productTitle,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        priceCents: item.priceCents,
        imageUrl: attrs?.imageUrl || null,
      };
    });

    const totalCents = formattedItems.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    );

    const itemCount = formattedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const customerName =
      cart.customerFirstName || cart.customerLastName
        ? [cart.customerFirstName, cart.customerLastName]
            .filter(Boolean)
            .join(" ")
        : null;

    result.push({
      id: cart.id,
      customerEmail: cart.customerEmail,
      customerName,
      items: formattedItems,
      itemCount,
      totalCents,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    });
  }

  return result;
}
