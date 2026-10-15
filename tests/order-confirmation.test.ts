import assert from "node:assert/strict";
import test from "node:test";
import * as business from "../src/lib/business-data";
import * as discounts from "../src/lib/orders/discount";
import * as statuses from "../src/lib/orders/status";
import en from "../messages/en.json";
import fr from "../messages/fr.json";
import type { Order } from "../src/types/order";
import { loadModule } from "./helpers/load-module";

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
};

const orderFixture = (changes: Partial<Order> = {}): Order =>
  ({
    id: "order_test",
    orderNumber: 123,
    fulfilmentMethod: "delivery",
    pickupLocation: null,
    customerEmail: "buyer@example.test",
    customerName: "Test Buyer",
    subtotalCents: 4000,
    shippingCents: 1000,
    taxCents: 650,
    totalCents: 5650,
    currency: "CAD",
    shippingAddress: {
      line1: "77 Customer Avenue",
      line2: "Unit 2",
      city: "Toronto",
      state: "ON",
      postalCode: "M5V 1A1",
      country: "CA",
    },
    items: [
      {
        productTitle: "Canvas Print",
        variantTitle: "8x10",
        quantity: 1,
        priceCents: 4000,
      },
    ],
    ...changes,
  }) as Order;

function emailHarness() {
  const sent: EmailPayload[] = [];
  const email = loadModule<typeof import("../src/lib/email/send")>(
    "src/lib/email/send.ts",
    {
      "./index": {
        resend: {
          emails: {
            send: async (payload: EmailPayload) => {
              sent.push(payload);
              return { data: { id: "email_test" }, error: null };
            },
          },
        },
        ORDER_EMAIL: "orders@example.test",
      },
      "@/lib/db/queries/admin-users": {
        getAdminUsersForOrderEmails: async () => [],
      },
      "@/lib/constants": { BASE_URL: "https://canvasprintshop.ca" },
      "@/lib/business-data": business,
      "@/lib/orders/status": statuses,
      "@/lib/orders/discount": discounts,
      "../../../messages/en.json": en,
      "../../../messages/fr.json": fr,
    }
  );
  return { email, sent };
}

for (const locale of ["en", "fr"] as const) {
  const t = (locale === "fr" ? fr : en).Email.orderConfirmation;

  for (const [location, street, label] of [
    [
      "montreal",
      locale === "fr" ? "1350, rue Mazurette" : "1350 Rue Mazurette",
      t.pickupMontreal,
    ],
    ["quebec-city", "1172 Av. du Lac-Saint-Charles", t.pickupQuebecCity],
  ]) {
    test(`${locale} confirmation identifies ${location} pickup and tells the customer to wait`, async () => {
      const { email, sent } = emailHarness();
      await email.sendOrderConfirmation(
        orderFixture({
          fulfilmentMethod: "pickup",
          pickupLocation: location,
          shippingCents: 0,
          totalCents: 4650,
        }),
        locale
      );

      assert.equal(sent.length, 1);
      assert.equal(sent[0].to, "buyer@example.test");
      assert.ok(sent[0].subject.includes("#123"));
      assert.ok(
        sent[0].html.includes(`${t.fulfilmentMethod}:</strong> ${label}`)
      );
      assert.ok(sent[0].html.includes(`<h3>${t.pickupAddress}:</h3>`));
      assert.ok(sent[0].html.includes(`pre-wrap;">${street}`));
      assert.ok(sent[0].html.includes(t.receivedPickup));
      assert.ok(sent[0].html.includes(`${t.pickup}:</strong> $0.00`));
      assert.ok(!sent[0].html.includes(t.received));
      assert.ok(!sent[0].html.includes(t.shippingAddress));
      assert.ok(!sent[0].html.includes("77 Customer Avenue"));
    });
  }

  for (const fulfilmentMethod of ["delivery", null] as const) {
    test(`${locale} confirmation explicitly identifies ${fulfilmentMethod ?? "legacy"} shipping even when free`, async () => {
      const { email, sent } = emailHarness();
      await email.sendOrderConfirmation(
        orderFixture({
          fulfilmentMethod,
          shippingCents: 0,
          totalCents: 4650,
        }),
        locale
      );

      const { html } = sent[0];
      assert.ok(html.includes(`${t.fulfilmentMethod}:</strong> ${t.shipping}`));
      assert.ok(html.includes(`<h3>${t.shippingAddress}:</h3>`));
      assert.ok(
        html.includes("77 Customer Avenue, Unit 2\nToronto, ON M5V 1A1\nCA")
      );
      assert.ok(html.includes(t.received));
      assert.ok(!html.includes(t.pickupAddress));
      assert.ok(!html.includes(t.receivedPickup));
    });
  }

  for (const pickupLocation of [null, "unknown-location"]) {
    test(`${locale} pickup with ${pickupLocation ?? "missing location"} never invents a collection point`, async () => {
      const { email, sent } = emailHarness();
      await email.sendOrderConfirmation(
        orderFixture({ fulfilmentMethod: "pickup", pickupLocation }),
        locale
      );

      const { html } = sent[0];
      assert.ok(
        html.includes(`${t.fulfilmentMethod}:</strong> ${t.pickup}</p>`)
      );
      assert.ok(html.includes(t.pickupLocationUnconfirmed));
      assert.ok(!html.includes(t.pickupMontreal));
      assert.ok(!html.includes(t.pickupQuebecCity));
      assert.ok(!html.includes("77 Customer Avenue"));
      assert.ok(!html.includes(t.received));
    });
  }

  test(`${locale} delivery without an address retains the translated fallback`, async () => {
    const { email, sent } = emailHarness();
    await email.sendOrderConfirmation(
      orderFixture({ shippingAddress: null }),
      locale
    );
    assert.ok(sent[0].html.includes(t.notProvided));
    assert.ok(sent[0].html.includes(t.shippingAddress));
  });
}

for (const [method, location, label, street] of [
  ["pickup", "montreal", "Pickup — Montreal", "1350 Rue Mazurette"],
  [
    "pickup",
    "quebec-city",
    "Pickup — Quebec City",
    "1172 Av. du Lac-Saint-Charles",
  ],
  ["delivery", null, "Shipping", "77 Customer Avenue"],
] as const) {
  test(`staff notification includes ${location ?? method} fulfilment details`, async () => {
    const { email, sent } = emailHarness();
    await email.sendAdminOrderNotification(
      orderFixture({ fulfilmentMethod: method, pickupLocation: location })
    );

    assert.equal(sent.length, 1);
    assert.ok(sent[0].html.includes(`Delivery method:</strong> ${label}`));
    assert.ok(sent[0].html.includes(street));
    assert.equal(
      sent[0].html.includes("Shipping Address"),
      method === "delivery"
    );
    assert.equal(
      sent[0].html.includes("77 Customer Avenue"),
      method === "delivery"
    );
  });
}
