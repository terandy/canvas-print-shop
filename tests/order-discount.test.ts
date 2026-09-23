import assert from "node:assert/strict";
import test from "node:test";
import { getOrderDiscountCents } from "../src/lib/orders/discount";

test("reconciles a fully discounted pickup order", () => {
  assert.equal(
    getOrderDiscountCents({
      subtotalCents: 5500,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 0,
    }),
    5500
  );
});

test("does not invent a discount for a regular order", () => {
  assert.equal(
    getOrderDiscountCents({
      subtotalCents: 5500,
      shippingCents: 3000,
      taxCents: 0,
      totalCents: 8500,
    }),
    0
  );
});
