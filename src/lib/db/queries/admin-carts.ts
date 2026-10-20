import { eq, and, exists, desc, sql } from "drizzle-orm";
import { db } from "../index";
import {
  carts,
  cartItems,
  productVariants,
  products,
  customers,
  cartRecoveryContacts,
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

export const ADMIN_CARTS_PAGE_SIZE = 50;

export function parseCartPage(value?: string): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 && page <= 1_000_000 ? page : 1;
}

export async function getActiveCarts(page = 1): Promise<{
  carts: AdminCart[];
  hasNextPage: boolean;
}> {
  const currentPage = parseCartPage(String(page));
  // Filter out empty carts before pagination. Fetch one extra cart to determine
  // whether there is another page, then join its complete set of items in the
  // same query. Request count stays constant as abandoned carts accumulate.
  const pageCarts = db
    .select({
      id: carts.id,
      customerEmail: sql<
        string | null
      >`coalesce(${cartRecoveryContacts.email}, ${customers.email})`.as(
        "customer_email"
      ),
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      createdAt: carts.createdAt,
      updatedAt: carts.updatedAt,
    })
    .from(carts)
    .leftJoin(customers, eq(carts.customerId, customers.id))
    .leftJoin(cartRecoveryContacts, eq(cartRecoveryContacts.cartId, carts.id))
    .where(
      and(
        eq(carts.status, "active"),
        exists(
          db
            .select({ id: cartItems.id })
            .from(cartItems)
            .where(eq(cartItems.cartId, carts.id))
        )
      )
    )
    .orderBy(desc(carts.updatedAt), desc(carts.id))
    .limit(ADMIN_CARTS_PAGE_SIZE + 1)
    .offset((currentPage - 1) * ADMIN_CARTS_PAGE_SIZE)
    .as("page_carts");

  const rows = await db
    .select({
      cart: {
        id: pageCarts.id,
        customerEmail: pageCarts.customerEmail,
        customerFirstName: pageCarts.customerFirstName,
        customerLastName: pageCarts.customerLastName,
        createdAt: pageCarts.createdAt,
        updatedAt: pageCarts.updatedAt,
      },
      item: {
        productTitle: products.titleEn,
        variantTitle: productVariants.title,
        quantity: cartItems.quantity,
        priceCents: productVariants.priceCents,
        attributes: cartItems.attributes,
      },
    })
    .from(pageCarts)
    .innerJoin(cartItems, eq(cartItems.cartId, pageCarts.id))
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .orderBy(
      desc(pageCarts.updatedAt),
      desc(pageCarts.id),
      cartItems.createdAt,
      cartItems.id
    );

  const grouped = new Map<string, AdminCart>();
  for (const { cart, item } of rows) {
    let result = grouped.get(cart.id);
    if (!result) {
      result = {
        id: cart.id,
        customerEmail: cart.customerEmail,
        customerName:
          [cart.customerFirstName, cart.customerLastName]
            .filter(Boolean)
            .join(" ") || null,
        items: [],
        itemCount: 0,
        totalCents: 0,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };
      grouped.set(cart.id, result);
    }
    result.items.push({
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      priceCents: item.priceCents,
      imageUrl: item.attributes?.imageUrl || null,
    });
    result.itemCount += item.quantity;
    result.totalCents += item.priceCents * item.quantity;
  }

  return {
    carts: Array.from(grouped.values()).slice(0, ADMIN_CARTS_PAGE_SIZE),
    hasNextPage: grouped.size > ADMIN_CARTS_PAGE_SIZE,
  };
}
