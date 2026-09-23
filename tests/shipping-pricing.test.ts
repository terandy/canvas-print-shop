import assert from "node:assert/strict";
import test from "node:test";
import type { Cart } from "../src/types/cart";
import { CANVAS_SIZES } from "../scripts/canvas-price-model";
import {
  SHIPPING_PRICING_VERSION,
  PREVIOUS_SHIPPING_PRICING_VERSION,
  SHIPPING_RATES_CENTS,
  assertValidStandardCheckoutShipping,
  assessAutomaticDelivery,
  getShippingBand,
  getShippingRateCents,
  normalizeCanadianPostalCode,
  normalizeCanadianRegion,
  postalCodeMatchesRegion,
} from "../src/lib/shipping/pricing";

const cart = (
  overrides: {
    handle?: string;
    quantity?: number;
    size?: string;
    frame?: string;
    lines?: number;
  } = {}
): Cart => {
  const quantity = overrides.quantity ?? 1;
  const item = {
    id: "item",
    variantId: "variant",
    productId: "product",
    productHandle: overrides.handle ?? "canvas",
    productTitle: "Canvas",
    variantTitle: "Canvas variant",
    quantity,
    priceCents: 10000,
    selectedOptions: {
      size: overrides.size ?? "30x40",
      frame: overrides.frame ?? "none",
    },
    attributes: {},
  };
  const items = Array.from({ length: overrides.lines ?? 1 }, (_, index) => ({
    ...item,
    id: `${item.id}-${index}`,
  }));

  return {
    id: "cart",
    items,
    totalQuantity: quantity * items.length,
    cost: {
      subtotalAmount: { amount: "100.00", currencyCode: "CAD" },
      taxAmount: { amount: "0.00", currencyCode: "CAD" },
      totalAmount: { amount: "100.00", currencyCode: "CAD" },
    },
  };
};

test("approved province and size matrix is stored exactly in cents", () => {
  assert.deepEqual(SHIPPING_RATES_CENTS, {
    QC: { small: 2000, medium: 2500, large: 3500, xl: 5000, xxl: 8500 },
    ON: { small: 2000, medium: 3000, large: 4500, xl: 6500, xxl: 12500 },
    NB: { small: 2000, medium: 3500, large: 5500, xl: 8000, xxl: 15500 },
    NS: { small: 2000, medium: 3500, large: 5500, xl: 8000, xxl: 15500 },
    PE: { small: 2000, medium: 3500, large: 5500, xl: 8000, xxl: 15500 },
    NL: { small: 2500, medium: 4000, large: 6500, xl: 9000, xxl: 17000 },
    MB: { small: 2000, medium: 3500, large: 6000, xl: 8500, xxl: 16500 },
    SK: { small: 2500, medium: 4000, large: 6500, xl: 9000, xxl: 17000 },
    AB: { small: 2500, medium: 4500, large: 7500, xl: 10000, xxl: 19000 },
    BC: { small: 3000, medium: 5000, large: 8000, xl: 10500, xxl: 20000 },
  });
  assert.equal(getShippingRateCents("QC", "xxl"), 8500);
  assert.equal(getShippingRateCents("BC", "xl"), 10500);
  assert.equal(getShippingRateCents("BC", "xxl"), 20000);
  for (const province of Object.keys(
    SHIPPING_RATES_CENTS
  ) as (keyof typeof SHIPPING_RATES_CENTS)[]) {
    for (const band of Object.keys(
      SHIPPING_RATES_CENTS[province]
    ) as (keyof typeof SHIPPING_RATES_CENTS.QC)[]) {
      assert.equal(
        getShippingRateCents(
          province,
          band,
          PREVIOUS_SHIPPING_PRICING_VERSION
        ) - getShippingRateCents(province, band),
        1000
      );
    }
  }
});

test("size bands use the longest packaged side and reserve XXL for 40x60", () => {
  assert.equal(getShippingBand({ width: 8, height: 12 }), "small");
  assert.equal(getShippingBand({ width: 12, height: 13 }), "medium");
  assert.equal(getShippingBand({ width: 16, height: 24 }), "medium");
  assert.equal(getShippingBand({ width: 24, height: 25 }), "large");
  assert.equal(getShippingBand({ width: 30, height: 40 }), "xl");
  assert.equal(getShippingBand({ width: 36, height: 48 }), "xl");
  assert.equal(getShippingBand({ width: 40, height: 60 }), "xxl");
  assert.equal(getShippingBand({ width: 39, height: 60 }), null);
  assert.equal(getShippingBand({ width: 50, height: 50 }), null);
});

test("all listed product types, frames and quantities get automatic delivery", () => {
  const eligible = assessAutomaticDelivery(cart());
  assert.equal(eligible.eligible, true);
  if (eligible.eligible) assert.equal(eligible.profile.band, "xl");

  for (const supported of [
    cart(),
    cart({ handle: "rolled-canvas-prints" }),
    cart({ frame: "black" }),
    cart({ quantity: 2 }),
    cart({ lines: 2 }),
  ]) {
    const result = assessAutomaticDelivery(supported);
    assert.equal(result.eligible, true);
    if (result.eligible) assert.equal(result.profile.band, "xl");
  }
  for (const unsupported of [
    cart({ handle: "unknown-product" }),
    cart({ quantity: -1 }),
    cart({ quantity: 1.5 }),
    cart({ size: "50x50" }),
    cart({ size: "not-a-size" }),
  ]) {
    assert.equal(assessAutomaticDelivery(unsupported).eligible, false);
  }
});

test("mixed carts pay only the largest size band once, independent of order and quantity", () => {
  const mixed = cart();
  mixed.items = [
    ...cart({ handle: "rolled-canvas-prints", size: "8x12", quantity: 4 })
      .items,
    ...cart({ frame: "black", size: "40x60", quantity: 2 }).items,
    ...cart({ size: "16x24", quantity: 3 }).items,
  ];
  mixed.totalQuantity = 9;
  for (const items of [mixed.items, [...mixed.items].reverse()]) {
    const result = assessAutomaticDelivery({ ...mixed, items });
    assert.equal(result.eligible, true);
    if (result.eligible) {
      assert.equal(result.profile.band, "xxl");
      assert.equal(getShippingRateCents("QC", result.profile.band), 8500);
      assert.equal(getShippingRateCents("BC", result.profile.band), 20000);
    }
  }
});

test("province names and Canadian postal prefixes must agree", () => {
  assert.equal(normalizeCanadianRegion("Québec"), "QC");
  assert.equal(normalizeCanadianRegion("British Columbia"), "BC");
  assert.equal(normalizeCanadianRegion("Territoires du Nord-Ouest"), "NT");
  assert.equal(normalizeCanadianPostalCode("v6b-1a1"), "V6B 1A1");
  assert.equal(postalCodeMatchesRegion("V6B 1A1", "BC"), true);
  assert.equal(postalCodeMatchesRegion("V6B 1A1", "QC"), false);
  assert.equal(normalizeCanadianPostalCode("D1A 1A1"), null);
});

test("every catalogue size and product finish has a shipping rate in all ten provinces", () => {
  for (const size of CANVAS_SIZES) {
    for (const handle of ["canvas", "rolled-canvas-prints"]) {
      for (const frame of ["none", "black"]) {
        const assessment = assessAutomaticDelivery(
          cart({ size, handle, frame, quantity: 3 })
        );
        assert.equal(assessment.eligible, true, `${handle}/${size}/${frame}`);
        if (assessment.eligible) {
          for (const province of Object.keys(
            SHIPPING_RATES_CENTS
          ) as (keyof typeof SHIPPING_RATES_CENTS)[]) {
            assert.ok(
              getShippingRateCents(province, assessment.profile.band) > 0
            );
          }
        }
      }
    }
  }
});

test("webhook validation accepts the approved quote and rejects tampering", () => {
  const base = {
    sessionMetadata: {
      shippingPricingVersion: SHIPPING_PRICING_VERSION,
      automaticDelivery: "true",
      shippingBand: "xl",
    },
    shippingAddress: { state: "BC", postalCode: "V6B 1A1", country: "CA" },
    shippingCents: 10500,
    resolvedShippingCents: 10500,
    fulfilmentMethod: "delivery" as const,
    deliveryQuote: {
      province: "BC" as const,
      band: "xl" as const,
      pricingVersion: SHIPPING_PRICING_VERSION,
    },
  };

  assert.doesNotThrow(() => assertValidStandardCheckoutShipping(base));
  assert.throws(() =>
    assertValidStandardCheckoutShipping({ ...base, shippingCents: 6000 })
  );
  assert.throws(() =>
    assertValidStandardCheckoutShipping({
      ...base,
      shippingAddress: { ...base.shippingAddress, postalCode: "H2X 1Y4" },
    })
  );
  assert.throws(() =>
    assertValidStandardCheckoutShipping({
      ...base,
      deliveryQuote: { ...base.deliveryQuote, province: "QC" },
    })
  );
  assert.doesNotThrow(() =>
    assertValidStandardCheckoutShipping({
      ...base,
      sessionMetadata: {
        ...base.sessionMetadata,
        shippingPricingVersion: PREVIOUS_SHIPPING_PRICING_VERSION,
      },
      shippingCents: 11500,
      resolvedShippingCents: 11500,
      deliveryQuote: {
        ...base.deliveryQuote,
        pricingVersion: PREVIOUS_SHIPPING_PRICING_VERSION,
      },
    })
  );
  assert.throws(() =>
    assertValidStandardCheckoutShipping({
      ...base,
      sessionMetadata: {
        ...base.sessionMetadata,
        shippingPricingVersion: "unknown",
      },
    })
  );
});

test("new checkout pickup is free and manual-delivery carts cannot select delivery", () => {
  assert.doesNotThrow(() =>
    assertValidStandardCheckoutShipping({
      sessionMetadata: {
        shippingPricingVersion: SHIPPING_PRICING_VERSION,
        automaticDelivery: "false",
        shippingBand: "manual",
      },
      shippingAddress: undefined,
      shippingCents: 0,
      resolvedShippingCents: 0,
      fulfilmentMethod: "pickup",
      deliveryQuote: null,
    })
  );
  assert.throws(() =>
    assertValidStandardCheckoutShipping({
      sessionMetadata: {
        shippingPricingVersion: SHIPPING_PRICING_VERSION,
        automaticDelivery: "false",
        shippingBand: "manual",
      },
      shippingAddress: { state: "QC", postalCode: "G1A 1A1", country: "CA" },
      shippingCents: 3000,
      resolvedShippingCents: 3000,
      fulfilmentMethod: "delivery",
      deliveryQuote: {
        province: "QC",
        band: "small",
        pricingVersion: SHIPPING_PRICING_VERSION,
      },
    })
  );
});

test("previously completed QA delivery retains strict retry validation", () => {
  const prior = {
    sessionMetadata: {
      shippingPricingVersion: PREVIOUS_SHIPPING_PRICING_VERSION,
      automaticDelivery: "true",
      shippingBand: "small",
      qaShippingWaiverCodeId: "promo_1UIweyKfgVVDSs6asCvCXrrW",
    },
    shippingAddress: { state: "ON", postalCode: "M5V 2T6", country: "CA" },
    shippingCents: 0,
    resolvedShippingCents: 0,
    subtotalCents: 10500,
    discountCents: 10500,
    fulfilmentMethod: "delivery" as const,
    deliveryQuote: {
      province: "ON" as const,
      band: "small" as const,
      pricingVersion: PREVIOUS_SHIPPING_PRICING_VERSION,
      waiverPromotionCodeId: "promo_1UIweyKfgVVDSs6asCvCXrrW",
    },
  };
  assert.doesNotThrow(() => assertValidStandardCheckoutShipping(prior));
  assert.throws(() =>
    assertValidStandardCheckoutShipping({ ...prior, discountCents: 0 })
  );
  assert.throws(() =>
    assertValidStandardCheckoutShipping({
      ...prior,
      sessionMetadata: {
        ...prior.sessionMetadata,
        shippingPricingVersion: SHIPPING_PRICING_VERSION,
      },
    })
  );
});
