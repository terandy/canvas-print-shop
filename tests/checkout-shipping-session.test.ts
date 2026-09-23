import assert from "node:assert/strict";
import test from "node:test";
import { BUSINESS_DATA } from "../src/lib/business-data";
import * as shippingPricing from "../src/lib/shipping/pricing";
import { loadModule } from "./helpers/load-module";

const stretchedCart = {
  id: "cart-id",
  totalQuantity: 1,
  items: [
    {
      id: "item-id",
      variantId: "variant-id",
      productId: "product-id",
      productHandle: "canvas",
      productTitle: "Canvas",
      variantTitle: "40x60 / none / gallery",
      quantity: 1,
      priceCents: 40000,
      selectedOptions: { size: "40x60", frame: "none", depth: "gallery" },
      attributes: {},
    },
  ],
};

function loadCheckout(params: {
  getCart?: () => Promise<unknown>;
  create?: (input: any) => Promise<any>;
  retrieve?: (id: string) => Promise<any>;
  update?: (id: string, input: any) => Promise<any>;
}) {
  return loadModule<typeof import("../src/lib/stripe/checkout")>(
    "src/lib/stripe/checkout.ts",
    {
      "next-intl/server": {
        getTranslations: async () => (key: string) => key,
      },
      "./index": {
        checkoutStripe: {
          checkout: {
            sessions: {
              create: params.create ?? (async () => ({})),
              retrieve: params.retrieve ?? (async () => ({})),
              update: params.update ?? (async () => ({})),
            },
          },
        },
        stripe: {
          checkout: {
            sessions: {
              create: params.create ?? (async () => ({})),
              retrieve: params.retrieve ?? (async () => ({})),
              update: params.update ?? (async () => ({})),
            },
          },
        },
      },
      "@/lib/db/queries/carts": {
        getCart: params.getCart ?? (async () => stretchedCart),
      },
      "@/lib/constants": { BASE_URL: "https://canvasprintshop.ca" },
      "@/lib/business-data": { BUSINESS_DATA },
      "@/lib/shipping/pricing": shippingPricing,
    }
  );
}

test("new standard checkout uses the supported Form API with pickup only", async () => {
  let createParams: any;
  const checkout = loadCheckout({
    create: async (input) => {
      createParams = input;
      return { client_secret: "cs_secret" };
    },
  });

  await checkout.createCheckoutSession("cart-id", "en");
  assert.equal(createParams.ui_mode, "form");
  assert.equal(createParams.success_url, undefined);
  assert.equal(createParams.cancel_url, undefined);
  assert.equal(
    createParams.return_url,
    "https://canvasprintshop.ca/en/checkout/success?session_id={CHECKOUT_SESSION_ID}"
  );
  assert.equal(createParams.permissions, undefined);
  assert.deepEqual(createParams.shipping_address_collection, {
    allowed_countries: ["CA"],
  });
  assert.equal(createParams.metadata.automaticDelivery, "true");
  assert.equal(createParams.metadata.shippingBand, "xxl");
  assert.equal(
    createParams.metadata.shippingPricingVersion,
    shippingPricing.SHIPPING_PRICING_VERSION
  );
  assert.equal(createParams.shipping_options.length, 2);
  assert.ok(
    createParams.shipping_options.every(
      (option: any) =>
        option.shipping_rate_data.metadata.fulfilmentMethod === "pickup" &&
        option.shipping_rate_data.fixed_amount.amount === 0
    )
  );
});

test("validated BC address adds the approved 40x60 delivery rate", async () => {
  let updateParams: any;
  const checkout = loadCheckout({
    retrieve: async (id) => ({
      id,
      status: "open",
      ui_mode: "form",
      metadata: {
        cartId: "cart-id",
        locale: "en",
        automaticDelivery: "true",
        shippingBand: "xxl",
        shippingPricingVersion: shippingPricing.SHIPPING_PRICING_VERSION,
      },
    }),
    update: async (_id, input) => {
      updateParams = input;
      return {};
    },
  });

  const result = await checkout.updateCheckoutShipping({
    sessionId: "cs_test_checkout",
    cartId: "cart-id",
    shippingDetails: {
      name: "Test Buyer",
      address: {
        country: "CA",
        line1: "123 Test Street",
        city: "Vancouver",
        postal_code: "V6B 1A1",
        state: "BC",
      },
    },
  });

  assert.deepEqual(result, { automaticDelivery: true });
  assert.equal(updateParams.shipping_options.length, 3);
  assert.equal(
    updateParams.shipping_options[0].shipping_rate_data.fixed_amount.amount,
    20000
  );
  assert.deepEqual(
    updateParams.shipping_options[0].shipping_rate_data.metadata,
    {
      fulfilmentMethod: "delivery",
      shippingProvince: "BC",
      shippingBand: "xxl",
      shippingPricingVersion: shippingPricing.SHIPPING_PRICING_VERSION,
    }
  );
});

test("an open session on the previous rate version keeps its original quote", async () => {
  let updateParams: any;
  const checkout = loadCheckout({
    retrieve: async () => ({
      status: "open",
      ui_mode: "form",
      metadata: {
        cartId: "cart-id",
        locale: "en",
        automaticDelivery: "true",
        shippingBand: "xxl",
        shippingPricingVersion:
          shippingPricing.PREVIOUS_SHIPPING_PRICING_VERSION,
      },
    }),
    update: async (_id, input) => {
      updateParams = input;
      return {};
    },
  });
  await checkout.updateCheckoutShipping({
    sessionId: "cs_test_previous_rate",
    cartId: "cart-id",
    shippingDetails: {
      name: "Test Buyer",
      address: {
        country: "CA",
        line1: "123 Test Street",
        city: "Vancouver",
        postal_code: "V6B 1A1",
        state: "BC",
      },
    },
  });
  assert.equal(
    updateParams.shipping_options[0].shipping_rate_data.fixed_amount.amount,
    21000
  );
  assert.equal(
    updateParams.shipping_options[0].shipping_rate_data.metadata
      .shippingPricingVersion,
    shippingPricing.PREVIOUS_SHIPPING_PRICING_VERSION
  );
});

test("territory addresses keep pickup but cannot gain a delivery rate", async () => {
  let updateParams: any;
  const checkout = loadCheckout({
    retrieve: async () => ({
      status: "open",
      ui_mode: "form",
      metadata: {
        cartId: "cart-id",
        locale: "fr",
        automaticDelivery: "true",
        shippingBand: "xxl",
        shippingPricingVersion: shippingPricing.SHIPPING_PRICING_VERSION,
      },
    }),
    update: async (_id, input) => {
      updateParams = input;
      return {};
    },
  });

  const result = await checkout.updateCheckoutShipping({
    sessionId: "cs_test_checkout",
    cartId: "cart-id",
    shippingDetails: {
      name: "Test Buyer",
      address: {
        country: "CA",
        line1: "123 Test Street",
        city: "Yellowknife",
        postal_code: "X1A 1A1",
        state: "NT",
      },
    },
  });

  assert.deepEqual(result, { automaticDelivery: false });
  assert.equal(updateParams.shipping_options.length, 2);
  assert.ok(
    updateParams.shipping_options.every(
      (option: any) =>
        option.shipping_rate_data.metadata.fulfilmentMethod === "pickup"
    )
  );
});

test("a session cannot be repriced from another cart", async () => {
  const checkout = loadCheckout({
    retrieve: async () => ({
      status: "open",
      ui_mode: "form",
      metadata: {
        cartId: "different-cart",
        shippingPricingVersion: shippingPricing.SHIPPING_PRICING_VERSION,
      },
    }),
  });

  await assert.rejects(
    checkout.updateCheckoutShipping({
      sessionId: "cs_test_checkout",
      cartId: "cart-id",
      shippingDetails: {
        name: "Test Buyer",
        address: {
          country: "CA",
          line1: "123 Test Street",
          city: "Vancouver",
          postal_code: "V6B 1A1",
          state: "BC",
        },
      },
    })
  );
});
