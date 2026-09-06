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
import { getProductPageContent } from "../src/lib/product-page-content";
import {
  getRolledSizeRows,
  STRETCHING_MARGIN_INCHES,
} from "../src/lib/rolled-canvas";
import {
  PRICES as ROLL_PRICES,
  SIZES,
  MARGINS,
} from "../scripts/seed-rolled-canvas";

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
    // Any 5-10 or 2-4 day range, however the unit is written. The first
    // version of this required "business days"/"jours" and so missed
    // "2 - 4 days" on the canvas product page.
    /\b5\s*(?:to|à|[–-])\s*10\s*(?:business |working |jours? |days?)/i,
    /\b2\s*(?:to|à|[–-])\s*4\s*(?:business |working |jours? |days?)/i,
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

test("rolled canvas is offered in the same sizes as stretched, and always cheaper", () => {
  // The stretched regular-depth unframed price for each size, as sold. Rolled
  // has to undercut this clearly or the product has no reason to exist.
  const stretched: Record<string, number> = {
    "8x10": 5000,
    "8x12": 5500,
    "12x12": 6000,
    "10x15": 6500,
    "11x14": 6500,
    "12x18": 7000,
    "16x20": 8500,
    "16x24": 9000,
    "20x20": 10000,
    "24x24": 11500,
    "20x30": 12000,
    "24x36": 15000,
    "30x40": 18000,
    "30x45": 20000,
    "36x48": 24500,
    "40x60": 35000,
  };

  assert.deepEqual(
    [...SIZES].sort(),
    Object.keys(stretched).sort(),
    "rolled and stretched must offer the same size list"
  );

  for (const size of SIZES) {
    const rolled = ROLL_PRICES[size];
    assert.ok(rolled < stretched[size], `${size}: rolled must be cheaper`);
    const ratio = rolled / stretched[size];
    assert.ok(
      ratio >= 0.45 && ratio <= 0.65,
      `${size}: rolled is ${Math.round(ratio * 100)}% of stretched, outside the intended 50-60% band`
    );
  }
});

test("rolled prices never go down as the canvas gets bigger", () => {
  const area = (s: string) => s.split("x").reduce((a, b) => a * Number(b), 1);
  const ordered = [...SIZES].sort((a, b) => area(a) - area(b));
  for (let i = 1; i < ordered.length; i++) {
    assert.ok(
      ROLL_PRICES[ordered[i]] >= ROLL_PRICES[ordered[i - 1]],
      `${ordered[i]} costs less than the smaller ${ordered[i - 1]}`
    );
  }
});

test("the margin choice is free and both options are labelled", () => {
  assert.deepEqual([...MARGINS].sort(), ["with", "without"]);
  for (const messages of [en, fr]) {
    for (const key of ["title", "select", "with", "without", "help"]) {
      assert.equal(
        typeof messages.Product.margin[key],
        "string",
        `Product.margin.${key} is missing`
      );
    }
    assert.ok(messages.Product.customSizeNote.includes("{email}"));
  }
});

test("every product with the rich page layout has the copy it renders", () => {
  // The layout is shared, so a missing key would surface as a raw
  // "Product.rollsPage.x" string on a live product page.
  for (const handle of ["canvas", "rolled-canvas-prints"]) {
    const content = getProductPageContent(handle);
    assert.ok(content, `${handle} has no page content`);

    for (const messages of [en, fr]) {
      const page = messages.Product[content!.namespace];
      assert.ok(page, `${content!.namespace} missing`);

      for (const section of [
        "productDescription",
        "qualitySection",
        "comparisonSection",
        "gallerySection",
        "keyDetails",
        "faq",
        "reviewsSection",
      ]) {
        assert.ok(page[section], `${content!.namespace}.${section} missing`);
      }
      for (const { key } of content!.featureCards) {
        assert.ok(
          page.qualitySection.cards[key],
          `${content!.namespace}.qualitySection.cards.${key} missing`
        );
      }
      for (const key of content!.comparisonRows) {
        assert.ok(
          page.comparisonSection.rows[key],
          `${content!.namespace}.comparisonSection.rows.${key} missing`
        );
      }
      for (const key of content!.keyDetails) {
        assert.ok(
          page.keyDetails.items[key],
          `${content!.namespace}.keyDetails.items.${key} missing`
        );
      }
      for (const key of content!.faqQuestions) {
        assert.ok(
          messages.Product.faq.questions[key],
          `Product.faq.questions.${key} missing`
        );
      }
      // The cross-link and the buying guide render only when configured, but
      // when they do every string they use has to exist.
      if (content!.alternateHandle) {
        assert.ok(
          page.alternative?.ctaLabel,
          `${content!.namespace}.alternative missing`
        );
        assert.ok(
          getProductPageContent(content!.alternateHandle),
          "alternate has no page"
        );
      }
      if (content!.buyingGuide) {
        const g = page.buyingGuide;
        assert.ok(g, `${content!.namespace}.buyingGuide missing`);
        for (const key of ["eyebrow", "title", "description"]) {
          assert.ok(g[key], `buyingGuide.${key} missing`);
        }
        for (const key of [
          "caption",
          "imageSize",
          "totalSize",
          "price",
          "footnote",
        ]) {
          assert.ok(g.table[key], `buyingGuide.table.${key} missing`);
        }
        assert.ok(g.table.totalSize.includes("{margin}"));
        assert.ok(g.table.footnote.includes("{margin}"));
        assert.ok(g.delivery.body.includes("{max}"));
        for (const key of ["print", "margin", "prepress"]) {
          assert.ok(g.contents.included[key], `included.${key} missing`);
        }
        for (const key of ["bars", "hardware", "assembly"]) {
          assert.ok(g.contents.notIncluded[key], `notIncluded.${key} missing`);
        }
        assert.ok(g.contents.notReadyToHang);
      }
    }
  }
});

test("the rolled size table separates image size from total sheet size", () => {
  // Confusing the two is the most common way a rolled canvas order goes wrong,
  // so the margin has to actually be added on all four sides.
  const rows = getRolledSizeRows({
    variants: [
      {
        options: { size: "16x20", margin: "with" },
        priceCents: 5000,
        availableForSale: true,
      },
      {
        options: { size: "16x20", margin: "without" },
        priceCents: 5000,
        availableForSale: true,
      },
      {
        options: { size: "8x10", margin: "with" },
        priceCents: 3000,
        availableForSale: true,
      },
    ],
  } as never);

  assert.equal(rows.length, 2, "one row per size, not per margin choice");
  assert.deepEqual(rows[0], {
    size: "8x10",
    image: { width: 8, height: 10 },
    total: { width: 12, height: 14 },
    priceCents: 3000,
  });
  const large = rows[1];
  assert.equal(
    large.total.width - large.image.width,
    2 * STRETCHING_MARGIN_INCHES
  );
  assert.equal(
    large.total.height - large.image.height,
    2 * STRETCHING_MARGIN_INCHES
  );
});

test("the size table never advertises a price that is not on sale", () => {
  const rows = getRolledSizeRows({
    variants: [
      {
        options: { size: "8x10", margin: "with" },
        priceCents: 3000,
        availableForSale: false,
      },
      {
        options: { size: "16x20", margin: "with" },
        priceCents: 5000,
        availableForSale: true,
      },
    ],
  } as never);
  assert.deepEqual(
    rows.map((r) => r.size),
    ["16x20"]
  );
});
