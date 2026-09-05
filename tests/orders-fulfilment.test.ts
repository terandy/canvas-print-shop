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
      "thankYou",
    ]) {
      assert.equal(typeof t[key], "string", `Email.pickupReady.${key} missing`);
    }
    // Placeholders the sender actually fills in must be present to be replaced.
    assert.ok(t.subject.includes("{orderNumber}"));
    assert.ok(t.message.includes("{orderNumber}"));
    assert.ok(t.bring.includes("{orderNumber}"));
    assert.ok(t.hours.includes("{email}"));
    assert.ok(t.greeting.includes("{name}"));
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
