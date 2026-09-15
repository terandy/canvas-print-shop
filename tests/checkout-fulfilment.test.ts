import assert from "node:assert/strict";
import test from "node:test";
import { BUSINESS_DATA } from "../src/lib/business-data";
import * as shippingPricing from "../src/lib/shipping/pricing";
import { loadModule } from "./helpers/load-module";

function checkout(retrieve: (...args: any[]) => Promise<unknown>) {
  return loadModule<typeof import("../src/lib/stripe/checkout")>(
    "src/lib/stripe/checkout.ts",
    {
      "next-intl/server": {},
      "./index": { stripe: { checkout: { sessions: { retrieve } } } },
      "@/lib/db/queries/carts": {},
      "@/lib/constants": {},
      "@/lib/business-data": { BUSINESS_DATA },
      "@/lib/shipping/pricing": shippingPricing,
    }
  );
}
const withRate = (metadata: Record<string, string>) => ({
  shipping_cost: { shipping_rate: { metadata } },
});

test("pickup, delivery and legacy shipping rates retain their intended fulfilment", async () => {
  for (const pickupLocation of ["montreal", "quebec-city"]) {
    const result = await checkout(async (id, options) => {
      assert.equal(id, "cs_test");
      assert.deepEqual(options, { expand: ["shipping_cost.shipping_rate"] });
      return withRate({ fulfilmentMethod: "pickup", pickupLocation });
    }).resolveFulfilment("cs_test");
    assert.deepEqual(result, { fulfilmentMethod: "pickup", pickupLocation });
  }
  for (const session of [
    withRate({ fulfilmentMethod: "delivery" }),
    withRate({}),
    {},
  ]) {
    assert.deepEqual(
      await checkout(async () => session).resolveFulfilment("cs_test"),
      { fulfilmentMethod: "delivery", pickupLocation: null }
    );
  }
});

test("lookup errors and malformed rates cannot be mistaken for delivery", async () => {
  const outage = new Error("Synthetic Stripe outage");
  await assert.rejects(
    checkout(async () => {
      throw outage;
    }).resolveFulfilment("cs_test"),
    outage
  );
  for (const session of [
    { shipping_cost: { shipping_rate: "shr_unexpanded" } },
    withRate({ fulfilmentMethod: "pickup", pickupLocation: "unknown" }),
    withRate({ fulfilmentMethod: "pickup" }),
    withRate({ fulfilmentMethod: "unexpected" }),
  ]) {
    await assert.rejects(
      checkout(async () => session).resolveFulfilment("cs_test")
    );
  }
});

for (const custom of [false, true]) {
  test(`${custom ? "custom" : "cart"} webhook fails before order creation, then preserves pickup on retry`, async () => {
    let outage = true;
    const writes: any[] = [];
    const resolver = checkout(async () => {
      if (outage) throw new Error("Synthetic Stripe outage");
      return withRate({
        fulfilmentMethod: "pickup",
        pickupLocation: "montreal",
      });
    });
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test",
          metadata: {
            locale: "fr",
            ...(custom ? { isCustomOrder: "true" } : { cartId: "cart_test" }),
          },
          customer_details: { email: "buyer@example.test" },
          amount_subtotal: 17500,
          amount_total: 17500,
          total_details: { amount_shipping: 0 },
          payment_intent: "pi_test",
        },
      },
    };
    const create = async (input: unknown) => {
      writes.push(input);
      return { orderNumber: 123 };
    };
    const route = loadModule<
      typeof import("../src/app/api/stripe/webhooks/route")
    >("src/app/api/stripe/webhooks/route.ts", {
      "next/server": { NextResponse: Response },
      "@/lib/stripe": { stripe: { webhooks: { constructEvent: () => event } } },
      "@/lib/db/queries/orders": {
        createOrderFromCheckout: create,
        createOrderFromCustomCheckout: create,
      },
      "@/lib/email/send": {
        sendOrderConfirmation: async () => {},
        sendAdminOrderNotification: async () => {},
      },
      "@/lib/stripe/checkout": resolver,
      "@/lib/shipping/pricing": shippingPricing,
    });
    const request = () =>
      new Request("https://example.test/api/stripe/webhooks", {
        method: "POST",
        headers: { "stripe-signature": "synthetic" },
        body: "synthetic",
      });
    assert.equal((await route.POST(request() as any)).status, 500);
    assert.equal(writes.length, 0);
    outage = false;
    assert.equal((await route.POST(request() as any)).status, 200);
    assert.equal(writes.length, 1);
    assert.equal(writes[0].fulfilmentMethod, "pickup");
    assert.equal(writes[0].pickupLocation, "montreal");
    assert.equal(writes[0].locale, "fr");
  });
}
