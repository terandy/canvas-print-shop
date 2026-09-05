import type { OrderStatus } from "@/types/order";

/**
 * Single source of truth for order statuses.
 *
 * The admin dashboard, the orders list and the order detail page each carried
 * their own copy of this map, so adding a status meant editing three files and
 * silently rendering grey "unknown" badges wherever one was missed.
 *
 * Order matters: this is the fulfilment lifecycle, and it drives the sequence
 * of the filter chips and the status dropdown. "printed" sits between "paid"
 * and "shipped" — the canvas is off the printer but not yet stretched, packed
 * and gone.
 *
 * The two paths diverge after "printed": a delivered order goes to "shipped",
 * a collected one to "ready_for_pickup", which emails the customer to come and
 * get it. Both end at "fulfilled".
 */
export const ORDER_STATUSES = [
  "pending",
  "paid",
  "printed",
  "ready_for_pickup",
  "shipped",
  "fulfilled",
  "cancelled",
  "refunded",
] as const satisfies readonly OrderStatus[];

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  printed: "bg-indigo-100 text-indigo-800",
  ready_for_pickup: "bg-teal-100 text-teal-800",
  shipped: "bg-purple-100 text-purple-800",
  fulfilled: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export const DEFAULT_STATUS_COLOR = "bg-gray-100 text-gray-800";

/** Badge classes for a status read back from the database, which is an
 *  unconstrained varchar and can hold a value this build does not know. */
export function statusColor(status: string): string {
  return STATUS_COLORS[status as OrderStatus] ?? DEFAULT_STATUS_COLOR;
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
