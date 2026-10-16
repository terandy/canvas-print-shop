import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";
import { createTranslator } from "next-intl";
import * as business from "../src/lib/business-data";
import * as pricing from "../src/lib/shipping/pricing";
import * as discount from "../src/lib/orders/discount";
import * as statuses from "../src/lib/orders/status";
import type { CreateOrderFromCustomCheckout } from "../src/types/order";
import en from "../messages/en.json";
import fr from "../messages/fr.json";
import { loadModule } from "./helpers/load-module";

type Locale = "en" | "fr";
type EmailPayload = { to: string | string[]; subject: string; html: string };

function formData(choice: string, locale: Locale = "en") {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    description: "Custom canvas print",
    customerEmail: "buyer@example.test",
    customSize: "30x40",
    price: "175.50",
    shipping: "25.50",
    fulfilment: choice,
    locale,
  }))
    data.set(key, value);
  return data;
}

function harness(options: { authorized?: boolean; failCreate?: boolean } = {}) {
  const requests: Stripe.Checkout.SessionCreateParams[] = [];
  const writes: CreateOrderFromCustomCheckout[] = [];
  const emails: EmailPayload[] = [];
  const getTranslations = async ({ locale, namespace }: any) =>
    createTranslator({
      locale,
      namespace,
      messages: locale === "fr" ? fr : en,
    });
  const stripe = {
    checkout: {
      sessions: {
        create: async (input: Stripe.Checkout.SessionCreateParams) => {
          if (options.failCreate) throw new Error("Synthetic Stripe failure");
          requests.push(input);
          return { id: "cs_test_custom", url: "https://example.test/pay" };
        },
        retrieve: async () => {
          const rate =
            requests.at(-1)?.shipping_options?.[0].shipping_rate_data;
          assert.ok(rate);
          return {
            shipping_cost: {
              shipping_rate: { metadata: rate.metadata },
              amount_total: rate.fixed_amount?.amount,
            },
          };
        },
      },
    },
  };
  const checkout = loadModule<typeof import("../src/lib/stripe/checkout")>(
    "src/lib/stripe/checkout.ts",
    {
      "next-intl/server": { getTranslations },
      "./index": { stripe },
      "@/lib/db/queries/carts": {},
      "@/lib/constants": { BASE_URL: "https://example.test" },
      "@/lib/business-data": business,
      "@/lib/shipping/pricing": pricing,
    }
  );
  const action = loadModule<
    typeof import("../src/lib/db/actions/custom-orders")
  >("src/lib/db/actions/custom-orders.ts", {
    "@/lib/auth/session": {
      getAdminSession: async () =>
        options.authorized === false ? null : { id: "admin_test" },
    },
    "@/lib/stripe/checkout": checkout,
    "next-intl/server": { getTranslations },
  });
  const email = loadModule<typeof import("../src/lib/email/send")>(
    "src/lib/email/send.ts",
    {
      "./index": {
        resend: {
          emails: {
            send: async (payload: EmailPayload) => {
              emails.push(payload);
              return { data: { id: "email_test" }, error: null };
            },
          },
        },
        ORDER_EMAIL: "orders@example.test",
      },
      "@/lib/db/queries/admin-users": {
        getAdminUsersForOrderEmails: async () => [],
      },
      "@/lib/constants": { BASE_URL: "https://example.test" },
      "@/lib/business-data": business,
      "@/lib/orders/status": statuses,
      "@/lib/orders/discount": discount,
      "../../../messages/en.json": en,
      "../../../messages/fr.json": fr,
    }
  );

  async function completeCheckout() {
    const request = requests.at(-1)!;
    const shippingCents =
      request.shipping_options![0].shipping_rate_data!.fixed_amount!.amount;
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_custom",
          metadata: request.metadata,
          customer_details: {
            email: "buyer@example.test",
            name: "Test Client",
          },
          payment_status: "paid",
          payment_intent: "pi_test_custom",
          amount_subtotal: 17550,
          amount_total: 17550 + shippingCents,
          total_details: { amount_shipping: shippingCents, amount_tax: 0 },
          collected_information: request.shipping_address_collection
            ? {
                shipping_details: {
                  name: "Test Client",
                  address: {
                    line1: "77 Customer Avenue",
                    city: "Toronto",
                    state: "ON",
                    postal_code: "M5V 1A1",
                    country: "CA",
                  },
                },
              }
            : undefined,
        },
      },
    };
    const route = loadModule<
      typeof import("../src/app/api/stripe/webhooks/route")
    >("src/app/api/stripe/webhooks/route.ts", {
      "next/server": { NextResponse: Response },
      "@/lib/stripe": { stripe: { webhooks: { constructEvent: () => event } } },
      "@/lib/db/queries/orders": {
        createOrderFromCustomCheckout: async (
          input: CreateOrderFromCustomCheckout
        ) => {
          writes.push(input);
          return {
            ...input,
            id: "order_test_custom",
            orderNumber: 321,
            currency: "CAD",
            shippingAddress: input.shippingAddress ?? null,
            items: [
              {
                productTitle: input.description,
                variantTitle: input.customSize,
                quantity: 1,
                priceCents: input.subtotalCents,
              },
            ],
          };
        },
      },
      "@/lib/email/send": email,
      "@/lib/stripe/checkout": checkout,
      "@/lib/shipping/pricing": pricing,
    });
    const response = await route.POST(
      new Request("https://example.test/api/stripe/webhooks", {
        method: "POST",
        headers: { "stripe-signature": "synthetic" },
        body: "synthetic",
      }) as any
    );
    assert.equal(response.status, 200);
  }
  return { action, checkout, requests, writes, emails, completeCheckout };
}

for (const locale of ["en", "fr"] as const) {
  for (const choice of ["montreal", "quebec-city", "delivery"] as const) {
    test(`${locale} custom ${choice} survives admin selection, payment, order creation and both emails`, async () => {
      const h = harness();
      const result = await h.action.createCustomOrderAction(
        {},
        formData(choice, locale)
      );
      assert.equal(result.success, true);
      assert.equal(result.fulfilment, choice);
      assert.equal(h.requests.length, 1);
      const request = h.requests[0];
      const isPickup = choice !== "delivery";
      assert.equal(request.shipping_options?.length, 1);
      const rate = request.shipping_options![0].shipping_rate_data!;
      assert.equal(rate.fixed_amount?.amount, isPickup ? 0 : 2550);
      assert.equal(
        request.metadata?.fulfilmentMethod,
        isPickup ? "pickup" : "delivery"
      );
      assert.equal(request.metadata?.pickupLocation, isPickup ? choice : "");
      assert.equal(
        rate.metadata?.fulfilmentMethod,
        request.metadata?.fulfilmentMethod
      );
      assert.equal(
        rate.metadata?.pickupLocation,
        isPickup ? choice : undefined
      );
      assert.equal(Boolean(request.shipping_address_collection), !isPickup);
      assert.equal(request.locale, locale === "fr" ? "fr-CA" : "en");
      const summary = request.custom_text?.submit;
      assert.ok(summary && typeof summary === "object");
      assert.match(
        summary.message,
        isPickup
          ? locale === "fr"
            ? /cueillette/
            : /pickup/
          : locale === "fr"
            ? /livraison/
            : /delivery/
      );

      await h.completeCheckout();
      assert.equal(h.writes.length, 1);
      assert.equal(
        h.writes[0].fulfilmentMethod,
        isPickup ? "pickup" : "delivery"
      );
      assert.equal(h.writes[0].pickupLocation, isPickup ? choice : null);
      assert.equal(h.writes[0].locale, locale);
      assert.equal(h.writes[0].shippingCents, isPickup ? 0 : 2550);
      assert.equal(Boolean(h.writes[0].shippingAddress), !isPickup);
      assert.equal(h.emails.length, 2);
      const t = (locale === "fr" ? fr : en).Email.orderConfirmation;
      const label =
        choice === "montreal"
          ? t.pickupMontreal
          : choice === "quebec-city"
            ? t.pickupQuebecCity
            : t.shipping;
      const customer = h.emails[0];
      assert.equal(customer.to, "buyer@example.test");
      assert.ok(customer.subject.includes("#321"));
      assert.ok(
        customer.html.includes(`${t.fulfilmentMethod}:</strong> ${label}`)
      );
      assert.ok(
        customer.html.includes(isPickup ? t.receivedPickup : t.received)
      );
      assert.ok(
        customer.html.includes(isPickup ? t.pickupAddress : t.shippingAddress)
      );
      if (isPickup) {
        const location =
          choice === "montreal"
            ? business.BUSINESS_DATA.locations.montrealBranch
            : business.BUSINESS_DATA.locations.quebecCityWorkshop;
        for (const line of business.getLocationAddressLines(location, locale))
          assert.ok(customer.html.includes(line));
        assert.ok(!customer.html.includes(t.received));
      } else {
        assert.ok(customer.html.includes("77 Customer Avenue"));
      }
      const staffLabel =
        choice === "montreal"
          ? "Pickup — Montreal"
          : choice === "quebec-city"
            ? "Pickup — Quebec City"
            : "Shipping";
      assert.ok(
        h.emails[1].html.includes(`Delivery method:</strong> ${staffLabel}`)
      );
    });
  }

  test(`${locale} rejects missing, duplicate and invalid custom-order choices before Stripe`, async () => {
    for (const choice of ["", "pickup", "unexpected"]) {
      const h = harness();
      const result = await h.action.createCustomOrderAction(
        {},
        formData(choice, locale)
      );
      assert.equal(
        result.error,
        (locale === "fr" ? fr : en).Admin.customOrder.errors.fulfilmentRequired
      );
      assert.equal(h.requests.length, 0);
    }
    for (const duplicate of [false, true]) {
      const h = harness();
      const data = formData("montreal", locale);
      if (duplicate) data.append("fulfilment", "delivery");
      else data.delete("fulfilment");
      assert.ok((await h.action.createCustomOrderAction({}, data)).error);
      assert.equal(h.requests.length, 0);
    }
  });
}

test("free custom delivery remains delivery and still collects a shipping address", async () => {
  const h = harness();
  const data = formData("delivery");
  data.set("shipping", "0");
  assert.equal(
    (await h.action.createCustomOrderAction({}, data)).success,
    true
  );
  assert.equal(
    h.requests[0].shipping_options![0].shipping_rate_data!.fixed_amount!.amount,
    0
  );
  assert.deepEqual(h.requests[0].shipping_address_collection, {
    allowed_countries: ["CA", "US"],
  });
  assert.equal(h.requests[0].metadata?.fulfilmentMethod, "delivery");
});

test("authentication, invalid delivery charges and Stripe failures cannot create a successful link", async () => {
  const unauthorized = harness({ authorized: false });
  assert.ok(
    (
      await unauthorized.action.createCustomOrderAction(
        {},
        formData("delivery")
      )
    ).error
  );
  assert.equal(unauthorized.requests.length, 0);
  for (const shipping of ["-1", "Infinity", "25bad"]) {
    const h = harness();
    const data = formData("delivery");
    data.set("shipping", shipping);
    assert.ok((await h.action.createCustomOrderAction({}, data)).error);
    assert.equal(h.requests.length, 0);
  }
  assert.equal(
    (
      await harness({ failCreate: true }).action.createCustomOrderAction(
        {},
        formData("montreal", "fr")
      )
    ).error,
    fr.Admin.customOrder.errors.createFailed
  );
});

test("custom checkout rejects unknown pickup locations before making a payment session", async () => {
  const h = harness();
  await assert.rejects(
    h.checkout.createCustomCheckoutSession({
      description: "Custom canvas",
      priceCents: 17550,
      shippingCents: 0,
      customerEmail: "buyer@example.test",
      locale: "en",
      fulfilmentMethod: "pickup",
      pickupLocation: "unknown" as any,
    }),
    /Invalid pickup location/
  );
  assert.equal(h.requests.length, 0);
});
