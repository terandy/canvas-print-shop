import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { loadModule } from "./helpers/load-module";

test("cart checkout uses validated full navigation and preserves browser-saved drafts", () => {
  const source = readFileSync("src/components/cart/cart-modal.tsx", "utf8");
  assert.match(source, /await getCheckoutDestination\(\)/);
  assert.match(source, /window\.location\.assign\(destination\.url\)/);
  assert.match(source, /disabled=\{pending\}/);
  assert.doesNotMatch(source, /localStorage\.clear\(\)/);
});

test("checkout reuses its Stripe instance across repeated renders and remounts", () => {
  const loadedKeys: string[] = [];
  const { default: Checkout } = loadModule<
    typeof import("../src/components/checkout/embedded-checkout")
  >("src/components/checkout/embedded-checkout.tsx", {
    react: React,
    "react/jsx-runtime": jsxRuntime,
    "next-intl": { useTranslations: () => (key: string) => key },
    "@stripe/react-stripe-js/checkout": {},
    "@stripe/stripe-js": {
      loadStripe: (key: string) => {
        loadedKeys.push(key);
        return Promise.resolve(null);
      },
    },
    "@/lib/utils/cart-actions": {},
    "@/lib/shipping/checkout-coordinator": {},
    "@/lib/stripe/checkout-form-client": {},
  });

  // Each render has fresh hook state, as when StrictMode discards a render or
  // checkout is unmounted and revisited. No Stripe/network calls are made.
  const render = (publishableKey: string) =>
    renderToString(React.createElement(Checkout, { publishableKey }));
  for (let i = 0; i < 3; i++) assert.match(render("pk_test_first"), /loading/);
  assert.deepEqual(loadedKeys, ["pk_test_first"]);
  render("pk_test_second");
  render("pk_test_first");
  assert.deepEqual(loadedKeys, ["pk_test_first", "pk_test_second"]);
});
