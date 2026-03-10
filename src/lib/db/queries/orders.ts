import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "../index";
import { orders, orderItems, customers } from "../schema";
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  CreateOrderFromCheckout,
  CreateOrderFromCustomCheckout,
} from "@/types/order";
import type { Money, Address } from "@/types/common";
import { getCartItemsForOrder, markCartAsConverted } from "./carts";

// Helper to format cents to Money
function formatMoney(cents: number, currency = "CAD"): Money {
  return {
    amount: (cents / 100).toFixed(2),
    currencyCode: currency,
  };
}

// Create order from Stripe checkout session
export async function createOrderFromCheckout(
  data: CreateOrderFromCheckout
): Promise<Order> {
  // Get cart items
  const cartItems = await getCartItemsForOrder(data.cartId);

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Find or create customer
  let customerId: string | null = null;
  const [existingCustomer] = await db
    .select()
    .from(customers)
    .where(eq(customers.email, data.customerEmail));

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        email: data.customerEmail,
        firstName: data.customerName?.split(" ")[0],
        lastName: data.customerName?.split(" ").slice(1).join(" "),
      })
      .returning({ id: customers.id });
    customerId = newCustomer.id;
  }

  // Create order
  const [order] = await db
    .insert(orders)
    .values({
      customerId,
      cartId: data.cartId,
      stripeCheckoutSessionId: data.stripeCheckoutSessionId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      status: "paid",
      paymentStatus: "paid",
      subtotalCents: data.subtotalCents,
      taxCents: data.taxCents,
      shippingCents: data.shippingCents,
      totalCents: data.totalCents,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      paidAt: new Date(),
    })
    .returning();

  // Create order items
  await db.insert(orderItems).values(
    cartItems.map((item) => ({
      orderId: order.id,
      variantId: item.variantId,
      productHandle: item.productHandle,
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      priceCents: item.priceCents,
      selectedOptions: item.selectedOptions,
      attributes: item.attributes,
    }))
  );

  // Mark cart as converted
  await markCartAsConverted(data.cartId);

  return getOrder(order.id) as Promise<Order>;
}

// Create order from custom checkout session (no cart)
export async function createOrderFromCustomCheckout(
  data: CreateOrderFromCustomCheckout
): Promise<Order> {
  // Find or create customer
  let customerId: string | null = null;
  const [existingCustomer] = await db
    .select()
    .from(customers)
    .where(eq(customers.email, data.customerEmail));

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        email: data.customerEmail,
        firstName: data.customerName?.split(" ")[0],
        lastName: data.customerName?.split(" ").slice(1).join(" "),
      })
      .returning({ id: customers.id });
    customerId = newCustomer.id;
  }

  // Create order
  const [order] = await db
    .insert(orders)
    .values({
      customerId,
      stripeCheckoutSessionId: data.stripeCheckoutSessionId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      status: "paid",
      paymentStatus: "paid",
      subtotalCents: data.subtotalCents,
      taxCents: data.taxCents,
      shippingCents: data.shippingCents,
      totalCents: data.totalCents,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      notes: `Custom order: ${data.description}${data.customSize ? ` (${data.customSize})` : ""}`,
      paidAt: new Date(),
    })
    .returning();

  // Create a single order item for the custom order
  await db.insert(orderItems).values({
    orderId: order.id,
    productHandle: "custom-order",
    productTitle: data.description,
    variantTitle: data.customSize ? `Custom ${data.customSize}` : "Custom",
    quantity: 1,
    priceCents: data.subtotalCents,
    selectedOptions: data.customSize
      ? { dimension: data.customSize }
      : {},
    attributes: data.imageUrl ? { imageUrl: data.imageUrl } : {},
  });

  return getOrder(order.id) as Promise<Order>;
}

// Get order by ID
export async function getOrder(orderId: string): Promise<Order | undefined> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));

  if (!order) return undefined;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const formattedItems: OrderItem[] = items.map((item) => ({
    id: item.id,
    variantId: item.variantId,
    productHandle: item.productHandle,
    productTitle: item.productTitle,
    variantTitle: item.variantTitle,
    quantity: item.quantity,
    priceCents: item.priceCents,
    price: formatMoney(item.priceCents),
    selectedOptions: item.selectedOptions,
    attributes: item.attributes,
  }));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    status: order.status as OrderStatus,
    paymentStatus: order.paymentStatus as PaymentStatus,
    subtotalCents: order.subtotalCents,
    taxCents: order.taxCents ?? 0,
    shippingCents: order.shippingCents ?? 0,
    totalCents: order.totalCents,
    currency: order.currency ?? "CAD",
    subtotal: formatMoney(order.subtotalCents),
    tax: formatMoney(order.taxCents ?? 0),
    shipping: formatMoney(order.shippingCents ?? 0),
    total: formatMoney(order.totalCents),
    shippingAddress: order.shippingAddress as Address | null,
    billingAddress: order.billingAddress as Address | null,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    notes: order.notes,
    items: formattedItems,
    paidAt: order.paidAt,
    shippedAt: order.shippedAt,
    fulfilledAt: order.fulfilledAt,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt ?? new Date(),
    updatedAt: order.updatedAt ?? new Date(),
  };
}

// Get order by Stripe checkout session ID
export async function getOrderByStripeSession(
  sessionId: string
): Promise<Order | undefined> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeCheckoutSessionId, sessionId));

  if (!order) return undefined;
  return getOrder(order.id);
}

// Get orders with filters (for admin)
export async function getOrders(filters?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  let query = db.select().from(orders).orderBy(desc(orders.createdAt));

  // Build where conditions
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status));
  }
  if (filters?.paymentStatus) {
    conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
  }
  if (filters?.startDate) {
    conditions.push(gte(orders.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(orders.createdAt, filters.endDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  if (filters?.limit) {
    query = query.limit(filters.limit) as typeof query;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as typeof query;
  }

  const orderRows = await query;

  const ordersWithItems = await Promise.all(
    orderRows.map((order) => getOrder(order.id))
  );

  return ordersWithItems.filter((o): o is Order => o !== undefined);
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order | undefined> {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  // Set timestamp based on status
  if (status === "shipped") {
    updates.shippedAt = new Date();
  } else if (status === "fulfilled") {
    updates.fulfilledAt = new Date();
  } else if (status === "cancelled") {
    updates.cancelledAt = new Date();
  }

  await db.update(orders).set(updates).where(eq(orders.id, orderId));

  return getOrder(orderId);
}

// Update payment status
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<Order | undefined> {
  await db
    .update(orders)
    .set({
      paymentStatus,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  return getOrder(orderId);
}

// Add tracking info
export async function addTrackingInfo(
  orderId: string,
  trackingNumber: string,
  trackingUrl?: string
): Promise<Order | undefined> {
  await db
    .update(orders)
    .set({
      trackingNumber,
      trackingUrl,
      status: "shipped",
      shippedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  return getOrder(orderId);
}
