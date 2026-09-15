import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import * as shippingPricing from "../src/lib/shipping/pricing";
import { checkoutErrorDetails } from "../src/lib/stripe/errors";
import { loadModule } from "./helpers/load-module";

const CART_ID = "123e4567-e89b-12d3-a456-426614174000";

function loadActions(params: {
  cartId?: string;
  cart?: unknown;
  locale?: string;
  createCheckoutSession?: (cartId: string, locale: string) => Promise<any>;
  updateCheckoutShipping?: (input: any) => Promise<any>;
}) {
  return loadModule<typeof import("../src/lib/utils/cart-actions")>(
    "src/lib/utils/cart-actions.ts",
    {
      "next/cache": { revalidateTag() {} },
      "next/headers": {
        cookies: async () => ({
          get: (key: string) =>
            key === "cartId" ? { value: params.cartId ?? CART_ID } : undefined,
          set() {},
        }),
      },
      "next/navigation": { redirect() {} },
      "next-intl/server": { getLocale: async () => params.locale ?? "en" },
      zod: { z },
      "../constants": { TAGS: { cart: "cart" } },
      "@/lib/db/queries/carts": {
        getCart: async () =>
          params.cart ?? { id: CART_ID, items: [{ id: "item" }] },
      },
      "@/lib/stripe/checkout": {
        createCheckoutSession:
          params.createCheckoutSession ??
          (async () => ({ client_secret: "secret" })),
        updateCheckoutShipping:
          params.updateCheckoutShipping ??
          (async () => ({ automaticDelivery: true })),
      },
      "@/lib/shipping/pricing": shippingPricing,
      "@/lib/stripe/errors": { checkoutErrorDetails },
    }
  );
}

const details = (state: string, postalCode: string) => ({
  checkoutSessionId: "cs_test_checkout",
  shippingDetails: {
    name: " Test Buyer ",
    address: {
      country: "ca",
      line1: " 123 Test Street ",
      line2: null,
      city: " Montreal ",
      postal_code: postalCode,
      state,
    },
  },
});

test("checkout destination validates the cart and returns only local bilingual paths", async () => {
  for (const locale of ["en", "fr", "https://untrusted.example"]) {
    const actions = loadActions({
      locale,
      createCheckoutSession: async () => {
        throw new Error("must not create a session during navigation");
      },
    });
    assert.deepEqual(await actions.getCheckoutDestination(), {
      ok: true,
      url: locale === "fr" ? "/fr/checkout" : "/en/checkout",
    });
  }
  assert.deepEqual(
    await loadActions({ cartId: "invalid" }).getCheckoutDestination(),
    { ok: false }
  );
  assert.deepEqual(
    await loadActions({ cart: { items: [] } }).getCheckoutDestination(),
    { ok: false }
  );
});

test("shipping action normalizes a matching Canadian address", async () => {
  let received: any;
  const actions = loadActions({
    updateCheckoutShipping: async (input) => {
      received = input;
      return { automaticDelivery: true };
    },
  });

  assert.deepEqual(
    await actions.updateEmbeddedCheckoutShipping(details("Québec", "h2x-1y4")),
    { ok: true, automaticDelivery: true }
  );
  assert.deepEqual(received, {
    sessionId: "cs_test_checkout",
    cartId: CART_ID,
    shippingDetails: {
      name: "Test Buyer",
      address: {
        country: "CA",
        line1: "123 Test Street",
        city: "Montreal",
        postal_code: "H2X 1Y4",
        state: "QC",
      },
    },
  });
});

test("shipping action rejects mismatched or structurally hostile input", async () => {
  let writes = 0;
  const actions = loadActions({
    updateCheckoutShipping: async () => {
      writes += 1;
      return { automaticDelivery: true };
    },
  });

  for (const input of [
    details("BC", "H2X 1Y4"),
    details("unknown", "H2X 1Y4"),
    details("QC", "not-postal"),
    { ...details("QC", "H2X 1Y4"), unexpected: "field" },
  ]) {
    assert.deepEqual(await actions.updateEmbeddedCheckoutShipping(input), {
      ok: false,
      code: "invalid-address",
    });
  }
  assert.equal(writes, 0);
});

test("checkout session action binds creation to the validated cart cookie", async () => {
  let calledWith: unknown;
  const actions = loadActions({
    createCheckoutSession: async (cartId, locale) => {
      calledWith = { cartId, locale };
      return { client_secret: "cs_secret" };
    },
  });

  assert.deepEqual(await actions.createEmbeddedCheckoutSession(), {
    ok: true,
    clientSecret: "cs_secret",
  });
  assert.deepEqual(calledWith, { cartId: CART_ID, locale: "en" });

  assert.deepEqual(
    await loadActions({ cartId: "not-a-uuid" }).createEmbeddedCheckoutSession(),
    { ok: false, code: "invalid-cart" }
  );
});
