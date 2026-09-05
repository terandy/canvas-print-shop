import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  ORDER_STATUSES,
  STATUS_COLORS,
  DEFAULT_STATUS_COLOR,
  isOrderStatus,
  statusColor,
} from "../src/lib/orders/status";
import { BUSINESS_DATA } from "../src/lib/business-data";

const root = process.cwd();
const en = JSON.parse(
  readFileSync(path.join(root, "messages/en.json"), "utf8")
);
const fr = JSON.parse(
  readFileSync(path.join(root, "messages/fr.json"), "utf8")
);

test("every status has a badge colour and a label in both locales", () => {
  for (const status of ORDER_STATUSES) {
    assert.ok(
      STATUS_COLORS[status],
      `${status} is missing a badge colour, so it would render grey`
    );
    assert.equal(
      typeof en.Admin.status[status],
      "string",
      `${status} is missing an English label`
    );
    assert.equal(
      typeof fr.Admin.status[status],
      "string",
      `${status} is missing a French label`
    );
  }
});

test("printed sits between paid and shipped in the lifecycle", () => {
  const order: readonly string[] = ORDER_STATUSES;
  assert.ok(order.includes("printed"));
  assert.ok(order.indexOf("printed") > order.indexOf("paid"));
  assert.ok(order.indexOf("printed") < order.indexOf("shipped"));
});

test("a pickup order has a lifecycle step that reaches the customer", () => {
  const order: readonly string[] = ORDER_STATUSES;
  // Pickup orders never get a tracking number, so "shipped" never applies to
  // them; without this step nothing would ever notify the customer.
  assert.ok(order.includes("ready_for_pickup"));
  assert.ok(order.indexOf("ready_for_pickup") > order.indexOf("printed"));
  assert.ok(order.indexOf("ready_for_pickup") < order.indexOf("fulfilled"));
  assert.equal(isOrderStatus("ready_for_pickup"), true);
});

test("the pickup email has every string it interpolates, in both locales", () => {
  for (const messages of [en, fr]) {
    const t = messages.Email.pickupReady;
    for (const key of [
      "subject",
      "title",
      "greeting",
      "greetingDefault",
      "message",
      "whereTitle",
      "bring",
      "hours",
      "days",
      "contact",
      "thankYou",
    ]) {
      assert.equal(typeof t[key], "string", `Email.pickupReady.${key} missing`);
    }
    // Placeholders the sender actually fills in must be present to be replaced.
    assert.ok(t.subject.includes("{orderNumber}"));
    assert.ok(t.message.includes("{orderNumber}"));
    assert.ok(t.bring.includes("{orderNumber}"));
    assert.ok(t.contact.includes("{email}"));
    assert.ok(t.greeting.includes("{name}"));
    for (const token of ["{days}", "{opens}", "{closes}"]) {
      assert.ok(t.hours.includes(token), `pickupReady.hours needs ${token}`);
    }
  }
});

test("processing is gone and can no longer be written", () => {
  const order: readonly string[] = ORDER_STATUSES;
  assert.equal(order.includes("processing"), false);
  assert.equal(isOrderStatus("processing"), false);
});

test("unknown statuses read from the varchar column fall back safely", () => {
  assert.equal(isOrderStatus("printed"), true);
  assert.equal(isOrderStatus("teleported"), false);
  assert.equal(statusColor("teleported"), DEFAULT_STATUS_COLOR);
  assert.equal(statusColor("printed"), STATUS_COLORS.printed);
});

test("both confirmed pickup counters have a localised checkout label", () => {
  const pickupKeys = {
    quebecCityWorkshop: "quebec-city",
    montrealBranch: "montreal",
  };
  const enabled = Object.entries(BUSINESS_DATA.locations)
    .filter(([, location]) => location.localPickup === true)
    .map(([key]) => pickupKeys[key as keyof typeof pickupKeys]);

  assert.deepEqual(enabled.sort(), ["montreal", "quebec-city"]);

  for (const key of enabled) {
    assert.equal(typeof en.Checkout.fulfilment.pickup[key], "string");
    assert.equal(typeof fr.Checkout.fulfilment.pickup[key], "string");
  }
  assert.equal(typeof en.Checkout.fulfilment.delivery, "string");
  assert.equal(typeof fr.Checkout.fulfilment.delivery, "string");
});

test("Stripe shipping option display names fit the 50 character limit", () => {
  const labels = [
    en.Checkout.fulfilment.delivery,
    fr.Checkout.fulfilment.delivery,
    ...Object.values(en.Checkout.fulfilment.pickup as Record<string, string>),
    ...Object.values(fr.Checkout.fulfilment.pickup as Record<string, string>),
  ];
  for (const label of labels) {
    assert.ok(
      label.length <= 50,
      `"${label}" is ${label.length} characters; Stripe truncates above 50`
    );
  }
});

test("the breakdown column has a label for everything it renders", () => {
  // The money lines deliberately live only in the table's own Total column,
  // so the cell shows line items, pickup and tracking — nothing else.
  for (const messages of [en, fr]) {
    for (const key of [
      "breakdown",
      "showDetails",
      "hideDetails",
      "pickupLabel",
      "pickupQuebecCity",
      "pickupMontreal",
      "trackingNumber",
    ]) {
      assert.equal(
        typeof messages.Admin.orders[key],
        "string",
        `Admin.orders.${key} is missing`
      );
    }
  }
});

test("no page claims free shipping or the old production window", () => {
  // Free shipping was withdrawn and the 2-4 day production figure was not
  // achievable; neither may reappear in copy, in either language.
  const banned = [
    /free ship/i,
    /livraison gratuite/i,
    /5\s*(?:to|à|[–-])\s*10 (?:business days|jours)/i,
    /2\s*(?:to|à|[–-])\s*4 (?:business days|jours)/i,
  ];
  const walk = (node: unknown, path: string): string[] =>
    typeof node === "string"
      ? banned.some((r) => r.test(node))
        ? [`${path}: ${node.slice(0, 80)}`]
        : []
      : node && typeof node === "object"
        ? Object.entries(node).flatMap(([k, v]) =>
            walk(v, path ? `${path}.${k}` : k)
          )
        : [];

  for (const [locale, messages] of [
    ["en", en],
    ["fr", fr],
  ] as const) {
    assert.deepEqual(walk(messages, ""), [], `${locale} still makes the claim`);
  }
});

test("the delivery commitment is a single 15 working day bound", () => {
  const { orderToDeliveryBusinessDays } = BUSINESS_DATA.productionAndDelivery;
  // Five to fifteen working days is the one-to-three-week window the copy
  // quotes; the two must not drift apart.
  assert.deepEqual(orderToDeliveryBusinessDays, { min: 5, max: 15 });
  // The separate production figure was removed rather than restated.
  assert.equal(
    "productionBusinessDays" in BUSINESS_DATA.productionAndDelivery,
    false
  );
});

test("every pickup counter publishes hours the shipping page can render", () => {
  const pickup = Object.values(BUSINESS_DATA.locations).filter(
    (l) => l.localPickup === true
  );
  assert.equal(pickup.length, 2);
  for (const location of pickup) {
    assert.ok(location.openingHours, `${location.name} has no opening hours`);
    assert.ok(location.openingHours!.opens);
    assert.ok(location.openingHours!.closes);
  }
  const montreal = pickup.find((l) => l.name.includes("Montreal"))!;
  assert.equal(montreal.openingHours!.closes, "16:00");
});
