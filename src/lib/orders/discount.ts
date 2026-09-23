/** Reconcile Stripe's undiscounted subtotal with the amount actually due. */
export function getOrderDiscountCents(order: {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}): number {
  return Math.max(
    0,
    order.subtotalCents +
      order.shippingCents +
      order.taxCents -
      order.totalCents
  );
}
