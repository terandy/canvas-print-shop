import assert from "node:assert/strict";
import test from "node:test";
import { createShippingCoordinator } from "../src/lib/shipping/checkout-coordinator";
import { checkoutErrorDetails } from "../src/lib/stripe/errors";

test("shipping changes serialize and only the latest address can pay", async () => {
  let release!: () => void;
  let started!: () => void;
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  const calls: string[] = [];
  const rates = createShippingCoordinator<string>(async (address) => {
    calls.push(address);
    if (address === "QC") {
      started();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    }
  });
  const first = rates.update("QC", "QC");
  await began;
  const second = rates.update("BC", "BC");
  assert.equal(rates.isReady("QC"), false);
  assert.equal(rates.isReady("BC"), false);
  release();
  assert.equal(await first, false);
  assert.equal(await second, true);
  assert.deepEqual(calls, ["QC", "BC"]);
  assert.equal(rates.isReady("QC"), false);
  assert.equal(rates.isReady("BC"), true);
  await rates.update("BC", "BC");
  assert.equal(calls.length, 2);
  rates.invalidate();
  assert.equal(rates.isReady("BC"), false);
});

test("failed shipping updates remain blocked and can be retried", async () => {
  let attempts = 0;
  const rates = createShippingCoordinator<string>(async () => {
    if (++attempts === 1) throw new Error("outage");
  });
  await assert.rejects(rates.update("BC", "BC"));
  assert.equal(rates.isReady("BC"), false);
  assert.equal(await rates.update("BC", "BC"), true);
  assert.equal(rates.isReady("BC"), true);
});

test("Stripe diagnostics expose only safe operational identifiers", () => {
  assert.deepEqual(
    checkoutErrorDetails({
      type: "StripeInvalidRequestError",
      param: "permissions[update_shipping_details]",
      requestId: "req_123",
      statusCode: 400,
      message: "secret and buyer@example.com",
      headers: { authorization: "secret" },
    }),
    {
      type: "StripeInvalidRequestError",
      param: "permissions[update_shipping_details]",
      requestId: "req_123",
      statusCode: 400,
    }
  );
  assert.deepEqual(
    checkoutErrorDetails({
      param: "private value with spaces",
      message: "secret",
    }),
    {}
  );
});
