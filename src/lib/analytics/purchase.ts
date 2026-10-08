import type { Order } from "@/types/order";

export type PurchaseEvent = {
  send_to: string;
  transaction_id: string;
  value: number;
  currency: string;
  tax: number;
  shipping: number;
  items: {
    item_id: string;
    item_name: string;
    item_variant: string;
    price: number;
    quantity: number;
  }[];
};

/** Only recent, real paid orders count as analytics purchases. */
export function buildPurchaseEvent(
  order: Order,
  now = new Date()
): PurchaseEvent | null {
  const paidAt = order.paidAt?.getTime();
  if (
    order.paymentStatus !== "paid" ||
    ["cancelled", "refunded", "pending"].includes(order.status) ||
    order.totalCents <= 0 ||
    !paidAt ||
    now.getTime() - paidAt < 0 ||
    now.getTime() - paidAt > 24 * 60 * 60 * 1000
  )
    return null;

  return {
    send_to: "G-3ZY7P4KVJ3",
    transaction_id: `CPS-${order.orderNumber}`,
    value: Math.max(
      0,
      (order.totalCents - order.shippingCents - order.taxCents) / 100
    ),
    currency: order.currency,
    tax: order.taxCents / 100,
    shipping: order.shippingCents / 100,
    items: order.items.map((item) => ({
      item_id: item.variantId || item.productHandle,
      item_name: item.productTitle,
      item_variant: item.variantTitle,
      price: item.priceCents / 100,
      quantity: item.quantity,
    })),
  };
}
