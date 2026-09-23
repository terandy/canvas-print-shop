import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { createTranslator } from "next-intl";
import { BUSINESS_DATA } from "../src/lib/business-data";
import * as pricing from "../src/lib/shipping/pricing";
import * as validation from "../src/lib/shipping/hosted-checkout";
import { checkoutErrorDetails } from "../src/lib/stripe/errors";
import { hostedCart } from "./fixtures/hosted-cart";
import { loadModule } from "./helpers/load-module";
import en from "../messages/en.json";
import fr from "../messages/fr.json";

const address = {
  name: "Test Recipient",
  line1: "123 Test Street",
  line2: "Unit 2",
  city: "Toronto",
  state: "ON",
  postalCode: "M5V 2T6",
};
function modules(
  options: {
    cart?: typeof hostedCart;
    create?: (input: any) => Promise<any>;
    retrieveIntent?: () => Promise<any>;
  } = {}
) {
  const cart = options.cart ?? hostedCart;
  const calls: any[] = [];
  const stripe = {
    checkout: {
      sessions: {
        create:
          options.create ??
          (async (input: any) => {
            calls.push(input);
            return { url: "https://checkout.stripe.com/c/pay/cs_test" };
          }),
        retrieve: async () => ({}),
      },
    },
    paymentIntents: { retrieve: options.retrieveIntent ?? (async () => ({})) },
  };
  const dependencies = {
    "node:crypto": { createHash },
    "next-intl/server": {
      getTranslations: async ({ locale, namespace }: any) =>
        createTranslator({
          locale,
          namespace,
          messages: locale === "fr" ? fr : en,
        }),
    },
    "./index": { stripe },
    "@/lib/db/queries/carts": { getCart: async () => cart },
    "@/lib/constants": { BASE_URL: "https://canvasprintshop.ca" },
    "@/lib/business-data": { BUSINESS_DATA },
    "@/lib/shipping/pricing": pricing,
    "@/lib/shipping/hosted-checkout": validation,
  };
  const checkout = loadModule<typeof import("../src/lib/stripe/checkout")>(
    "src/lib/stripe/checkout.ts",
    dependencies
  );
  const hosted = loadModule<typeof import("../src/lib/stripe/hosted-checkout")>(
    "src/lib/stripe/hosted-checkout.ts",
    { ...dependencies, "./checkout": checkout }
  );
  return { hosted, checkout, calls };
}

test("hosted delivery fixes the reviewed province rate and destination before payment", async () => {
  const { hosted, calls } = modules();
  const summary = hosted.getHostedCheckoutSummary(hostedCart);
  assert.equal(summary.subtotalCents, 50000);
  assert.deepEqual(
    [summary.rates.QC, summary.rates.ON, summary.rates.BC],
    [5000, 6500, 10500]
  );
  await hosted.createHostedCheckoutSession(
    hostedCart.id,
    "en",
    { method: "delivery", shipping: address },
    summary.fingerprint
  );
  const session = calls[0];
  assert.equal(session.allow_promotion_codes, true);
  assert.equal(session.ui_mode, undefined);
  assert.equal(session.return_url, undefined);
  assert.equal(session.cancel_url, "https://canvasprintshop.ca/en/checkout");
  assert.match(session.success_url, /\/en\/checkout\/success/);
  assert.equal(session.shipping_address_collection, undefined);
  assert.equal(session.shipping_options.length, 1);
  assert.equal(
    session.shipping_options[0].shipping_rate_data.fixed_amount.amount,
    6500
  );
  const parsed = validation.hostedCheckoutSchema.parse({
    method: "delivery",
    shipping: address,
  });
  assert.equal(parsed.method, "delivery");
  if (parsed.method !== "delivery") throw new Error("Expected delivery");
  assert.deepEqual(session.payment_intent_data.shipping, parsed.shipping);
  assert.equal(session.metadata.checkoutFlow, "hosted-v1");
  assert.equal(session.metadata.fulfilmentMethod, "delivery");
  assert.match(
    session.custom_text.submit.message,
    /Test Recipient, 123 Test Street, Unit 2, Toronto, ON, M5V 2T6/
  );
  assert.deepEqual(
    session.line_items.map((item: any) => item.quantity),
    [2, 3]
  );
});

test("both pickup locations cost zero and need no delivery address in either language", async () => {
  for (const locale of ["en", "fr"] as const)
    for (const location of ["montreal", "quebec-city"]) {
      const { hosted, calls } = modules();
      await hosted.createHostedCheckoutSession(
        hostedCart.id,
        locale,
        { method: "pickup", location },
        hosted.getHostedCheckoutSummary(hostedCart).fingerprint
      );
      const session = calls[0];
      assert.equal(session.shipping_options.length, 1);
      assert.equal(
        session.shipping_options[0].shipping_rate_data.fixed_amount.amount,
        0
      );
      assert.equal(
        session.shipping_options[0].shipping_rate_data.metadata.pickupLocation,
        location
      );
      assert.equal(session.payment_intent_data, undefined);
      assert.equal(session.locale, locale === "fr" ? "fr-CA" : "en");
      assert.match(
        session.custom_text.submit.message,
        locale === "fr" ? /cueillette/ : /pickup/
      );
    }
});

test("tampered prices, invalid addresses, territories and stale carts fail before Stripe", async () => {
  const { hosted, calls } = modules();
  const fingerprint = hosted.getHostedCheckoutSummary(hostedCart).fingerprint;
  for (const input of [
    { method: "delivery", shipping: { ...address, postalCode: "H2X 1Y4" } },
    {
      method: "delivery",
      shipping: { ...address, state: "YT", postalCode: "Y1A 1A1" },
    },
    { method: "delivery", shipping: { ...address, line1: " " } },
    { method: "delivery", shipping: address, shippingCents: 0 },
    { method: "pickup", location: "unknown" },
  ])
    await assert.rejects(
      hosted.createHostedCheckoutSession(
        hostedCart.id,
        "en",
        input,
        fingerprint
      )
    );
  const changed = structuredClone(hostedCart);
  changed.items[0].quantity = 1;
  changed.totalQuantity = 4;
  await assert.rejects(
    modules({ cart: changed }).hosted.createHostedCheckoutSession(
      hostedCart.id,
      "en",
      { method: "delivery", shipping: address },
      fingerprint
    ),
    /cart-changed/
  );
  assert.equal(calls.length, 0);
});

test("delivery order uses the fixed PaymentIntent shipping address; missing evidence retries", async () => {
  const shipping = validation.hostedCheckoutSchema.parse({
    method: "delivery",
    shipping: address,
  });
  assert.equal(shipping.method, "delivery");
  if (shipping.method !== "delivery") throw new Error("Expected delivery");
  const session: any = {
    metadata: { checkoutFlow: "hosted-v1", fulfilmentMethod: "delivery" },
    payment_intent: "pi_test",
    customer_details: { address: { state: "BC" } },
  };
  const { checkout } = modules({
    retrieveIntent: async () => ({ shipping: shipping.shipping }),
  });
  assert.deepEqual(
    await checkout.resolveCheckoutAddress(session),
    shipping.shipping
  );
  await assert.rejects(
    modules().checkout.resolveCheckoutAddress(session),
    /address is missing/
  );
  assert.equal(
    await checkout.resolveCheckoutAddress({
      ...session,
      metadata: { checkoutFlow: "hosted-v1", fulfilmentMethod: "pickup" },
    }),
    undefined
  );
  assert.deepEqual(
    await checkout.resolveCheckoutAddress({
      shipping: shipping.shipping,
    } as any),
    shipping.shipping
  );
});

test("a previous zero-dollar QA session retains its confirmed delivery address", async () => {
  const { checkout } = modules();
  const info = await checkout.resolveCheckoutAddress({
    metadata: {
      checkoutFlow: "hosted-v1",
      fulfilmentMethod: "delivery",
      shippingPricingVersion: pricing.PREVIOUS_SHIPPING_PRICING_VERSION,
      qaShippingWaiverCodeId: "promo_1UIweyKfgVVDSs6asCvCXrrW",
      qaShippingName: address.name,
      qaShippingLine1: address.line1,
      qaShippingLine2: address.line2,
      qaShippingCity: address.city,
      qaShippingState: address.state,
      qaShippingPostalCode: address.postalCode,
    },
    payment_intent: null,
  } as any);
  assert.equal(info?.address?.state, "ON");
  assert.equal(info?.address?.postal_code, "M5V 2T6");
});

test("server action binds checkout to the cart cookie and returns recoverable errors", async () => {
  let calls = 0;
  function action(cartId: string, failure?: string) {
    return loadModule<
      typeof import("../src/lib/utils/hosted-checkout-actions")
    >("src/lib/utils/hosted-checkout-actions.ts", {
      "next/headers": {
        cookies: async () => ({ get: () => ({ value: cartId }) }),
      },
      "next-intl/server": { getLocale: async () => "fr" },
      "@/lib/shipping/hosted-checkout": validation,
      "@/lib/stripe/hosted-checkout": {
        createHostedCheckoutSession: async (id: string, locale: string) => {
          calls++;
          assert.equal(id, hostedCart.id);
          assert.equal(locale, "fr");
          if (failure) throw new Error(failure);
          return { url: "https://checkout.stripe.com/c/pay/test" };
        },
      },
      "@/lib/stripe/errors": { checkoutErrorDetails },
    });
  }
  const input = { method: "pickup", location: "montreal" };
  const fingerprint = "a".repeat(64);
  assert.deepEqual(
    await action("bad-cookie").startHostedCheckout(input, fingerprint),
    { ok: false, code: "invalid-cart" }
  );
  assert.deepEqual(
    await action(hostedCart.id).startHostedCheckout(
      { ...input, shippingCents: 0 },
      fingerprint
    ),
    { ok: false, code: "invalid-address" }
  );
  assert.equal(calls, 0);
  assert.deepEqual(
    await action(hostedCart.id, "cart-changed").startHostedCheckout(
      input,
      fingerprint
    ),
    { ok: false, code: "cart-changed" }
  );
  assert.deepEqual(
    await action(hostedCart.id, "Synthetic outage").startHostedCheckout(
      input,
      fingerprint
    ),
    { ok: false, code: "unavailable" }
  );
  assert.equal(
    (await action(hostedCart.id).startHostedCheckout(input, fingerprint)).ok,
    true
  );
});

for (const choice of ["delivery", "montreal", "quebec-city"] as const) {
  test(`completed hosted ${choice} carries the selected fulfilment into the order and notifications`, async () => {
    const shipping = validation.hostedCheckoutSchema.parse({
      method: "delivery",
      shipping: address,
    });
    if (shipping.method !== "delivery") throw new Error("Expected delivery");
    let failAddressLookup = choice === "delivery";
    let destination = shipping.shipping;
    const writes: any[] = [];
    const notifications: string[] = [];
    const shippingCents = choice === "delivery" ? 6500 : 0;
    const event: any = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_hosted",
          metadata: {
            cartId: hostedCart.id,
            checkoutFlow: "hosted-v1",
            fulfilmentMethod: choice === "delivery" ? "delivery" : "pickup",
            locale: "fr",
            shippingPricingVersion: pricing.SHIPPING_PRICING_VERSION,
            shippingBand: "xl",
            automaticDelivery: "true",
          },
          payment_status: "paid",
          payment_intent: "pi_test",
          amount_subtotal: 50000,
          amount_total: 50000 + shippingCents,
          total_details: { amount_shipping: shippingCents, amount_tax: 0 },
          customer_details: {
            email: "buyer@example.test",
            name: "Billing Name",
            phone: "+15145550123",
            address: { state: "BC", country: "CA" },
          },
        },
      },
    };
    const { checkout } = modules({
      retrieveIntent: async () => {
        if (failAddressLookup) throw new Error("Synthetic Stripe outage");
        return { shipping: destination };
      },
    });
    const route = loadModule<
      typeof import("../src/app/api/stripe/webhooks/route")
    >("src/app/api/stripe/webhooks/route.ts", {
      "next/server": { NextResponse: Response },
      "@/lib/stripe": { stripe: { webhooks: { constructEvent: () => event } } },
      "@/lib/db/queries/orders": {
        createOrderFromCheckout: async (data: any) => {
          writes.push(data);
          return { orderNumber: 123 };
        },
      },
      "@/lib/email/send": {
        sendOrderConfirmation: async () => {
          notifications.push("customer");
        },
        sendAdminOrderNotification: async () => {
          notifications.push("admin");
        },
      },
      "@/lib/stripe/checkout": {
        ...checkout,
        resolveCheckoutShipping: async () => ({
          fulfilmentMethod: choice === "delivery" ? "delivery" : "pickup",
          pickupLocation: choice === "delivery" ? null : choice,
          shippingAmountCents: shippingCents,
          deliveryQuote:
            choice === "delivery"
              ? {
                  province: "ON",
                  band: "xl",
                  pricingVersion: pricing.SHIPPING_PRICING_VERSION,
                }
              : null,
        }),
      },
      "@/lib/shipping/pricing": pricing,
    });
    const request = () =>
      new Request("https://example.test/api/stripe/webhooks", {
        method: "POST",
        headers: { "stripe-signature": "synthetic" },
        body: "synthetic",
      });
    event.data.object.payment_status = "unpaid";
    assert.equal((await route.POST(request() as any)).status, 500);
    assert.equal(writes.length, 0);
    event.data.object.payment_status = "paid";
    if (choice === "delivery") {
      assert.equal((await route.POST(request() as any)).status, 500);
      assert.equal(writes.length, 0);
      assert.equal(notifications.length, 0);
      failAddressLookup = false;
      destination = {
        ...shipping.shipping,
        address: {
          ...shipping.shipping.address,
          state: "BC",
          postal_code: "V6B 1A1",
        },
      };
      assert.equal((await route.POST(request() as any)).status, 500);
      assert.equal(writes.length, 0);
      destination = shipping.shipping;
    }
    assert.equal((await route.POST(request() as any)).status, 200);
    assert.equal(writes.length, 1);
    assert.equal(writes[0].totalCents, 50000 + shippingCents);
    assert.equal(writes[0].shippingCents, shippingCents);
    assert.equal(
      writes[0].fulfilmentMethod,
      choice === "delivery" ? "delivery" : "pickup"
    );
    assert.equal(
      writes[0].pickupLocation,
      choice === "delivery" ? null : choice
    );
    assert.equal(writes[0].locale, "fr");
    assert.equal(writes[0].stripePaymentIntentId, "pi_test");
    assert.equal(
      writes[0].customerName,
      choice === "delivery" ? "Test Recipient" : "Billing Name"
    );
    assert.equal(
      writes[0].shippingAddress?.state,
      choice === "delivery" ? "ON" : undefined
    );
    assert.deepEqual(notifications, ["customer", "admin"]);
  });
}
