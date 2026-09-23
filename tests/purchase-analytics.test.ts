import assert from "node:assert/strict";
import test from "node:test";
import { buildPurchaseEvent } from "../src/lib/analytics/purchase";
import type { Order } from "../src/types/order";

const now = new Date("2026-09-23T21:00:00Z");
const paidOrder = {
  orderNumber: 1033,
  status: "paid",
  paymentStatus: "paid",
  paidAt: new Date("2026-09-23T20:59:00Z"),
  subtotalCents: 10500,
  shippingCents: 2000,
  taxCents: 0,
  totalCents: 12500,
  currency: "CAD",
  customerEmail: "buyer@example.test",
  items: [
    {
      variantId: "variant-8x10",
      productHandle: "canvas",
      productTitle: "Canvas Print",
      variantTitle: "8x10 / black",
      priceCents: 10500,
      quantity: 1,
    },
  ],
} as Order;

test("a real paid order creates a purchase event with an order ID and net value", () => {
  const event = buildPurchaseEvent(paidOrder, now);
  assert.equal(event?.transaction_id, "CPS-1033");
  assert.equal(event?.value, 105);
  assert.equal(event?.shipping, 20);
  assert.equal(event?.currency, "CAD");
  assert.equal(event?.items[0].item_id, "variant-8x10");
  assert.doesNotMatch(JSON.stringify(event), /buyer@example\.test/);
});

test("zero-dollar QA, cancelled, unpaid and old orders cannot count as purchases", () => {
  assert.equal(
    buildPurchaseEvent({ ...paidOrder, totalCents: 0 } as Order, now),
    null
  );
  assert.equal(
    buildPurchaseEvent({ ...paidOrder, status: "cancelled" } as Order, now),
    null
  );
  assert.equal(
    buildPurchaseEvent({ ...paidOrder, paymentStatus: "pending" } as Order, now),
    null
  );
  assert.equal(
    buildPurchaseEvent(
      { ...paidOrder, paidAt: new Date("2026-09-21T12:00:00Z") } as Order,
      now
    ),
    null
  );
});
