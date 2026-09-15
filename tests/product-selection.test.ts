import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import * as jsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getInitialFormState,
  getSelectedVariant,
} from "../src/contexts/product-context/utils";
import * as data from "../src/contexts/product-context/data";
import { DEFAULT_CANVAS_IMAGE } from "../src/lib/constants";
import { PRICES, SIZES, MARGINS } from "../scripts/seed-rolled-canvas";
import type { Product, ProductVariant } from "../src/types/product";
import { loadModule } from "./helpers/load-module";

const variants: ProductVariant[] = SIZES.flatMap((size) =>
  MARGINS.map((margin) => ({
    id: `${size}-${margin}`,
    sku: null,
    title: `${size} / ${margin}`,
    options: { size, margin },
    availableForSale: true,
    priceCents: PRICES[size],
    price: { amount: (PRICES[size] / 100).toFixed(2), currencyCode: "CAD" },
  }))
);
const product = {
  handle: "rolled-canvas-prints",
  variants,
  options: [
    { name: "size", values: SIZES, affectsPrice: true },
    { name: "margin", values: MARGINS, affectsPrice: false },
  ],
} as Product;

test("every rolled size and margin resolves to its own price and variant", () => {
  for (const size of SIZES)
    for (const margin of MARGINS) {
      const selected = getSelectedVariant(product, { size, margin });
      assert.equal(selected?.id, `${size}-${margin}`);
      assert.equal(selected?.priceCents, PRICES[size]);
    }
  assert.equal(
    getSelectedVariant(product, getInitialFormState(product.handle))?.id,
    "8x10-with"
  );
});

test("blank, missing, stale and unavailable selections never fall back to another size", () => {
  const invalidStates: Record<string, string>[] = [
    { size: "40x60", margin: "" },
    { size: "40x60" },
    { size: "custom", margin: "with" },
    { size: "40x60", margin: "old" },
  ];
  for (const state of invalidStates) {
    assert.equal(getSelectedVariant(product, state), undefined);
  }
  assert.equal(
    getSelectedVariant(
      { ...product, variants: [] },
      { size: "40x60", margin: "with" }
    ),
    undefined
  );
  assert.equal(
    getSelectedVariant(
      {
        ...product,
        variants: variants.map((v) => ({ ...v, availableForSale: false })),
      },
      { size: "40x60", margin: "with" }
    ),
    undefined
  );
});

test("stretched frame and depth combinations still match exactly", () => {
  const stretched = {
    options: [
      { name: "size", values: ["8x10"], affectsPrice: true },
      { name: "frame", values: ["none", "black"], affectsPrice: true },
      { name: "depth", values: ["regular", "gallery"], affectsPrice: true },
    ],
    variants: [
      {
        ...variants[0],
        id: "gallery",
        options: { size: "8x10", frame: "none", depth: "gallery" },
      },
      {
        ...variants[0],
        id: "framed",
        options: { size: "8x10", frame: "black", depth: "regular" },
      },
    ],
  };
  assert.equal(
    getSelectedVariant(stretched, {
      size: "8x10",
      frame: "none",
      depth: "gallery",
    })?.id,
    "gallery"
  );
  assert.equal(
    getSelectedVariant(stretched, {
      size: "8x10",
      frame: "black",
      depth: "regular",
    })?.id,
    "framed"
  );
  assert.equal(
    getSelectedVariant(stretched, {
      size: "8x10",
      frame: "black",
      depth: "gallery",
    }),
    undefined
  );
});

test("the product provider keeps an invalid margin unresolved", () => {
  const module = loadModule<
    typeof import("../src/contexts/product-context/context")
  >("src/contexts/product-context/context.tsx", {
    react: React,
    "react/jsx-runtime": jsx,
    "@/lib/constants": { DEFAULT_CANVAS_IMAGE },
    "./data": data,
    "./utils": {
      getSelectedVariant,
      getInitialFormState: () => ({ size: "40x60", margin: "" }),
    },
  });
  let selected: ProductVariant | undefined;
  function Probe() {
    selected = module.useProduct().variant;
    return null;
  }
  renderToStaticMarkup(
    React.createElement(module.ProductProvider, {
      product,
      cartItemID: null,
      children: React.createElement(Probe),
    })
  );
  assert.equal(selected, undefined);
});

test("invalid selections block add and save, and do not show a substitute price", async () => {
  let submissions = 0;
  const state = {
    size: "40x60",
    margin: "",
    imgURL: "https://example.test/photo.jpg",
  };
  const context = {
    product,
    state,
    variant: getSelectedVariant(product, state),
  };
  const common = {
    react: {
      ...React,
      useActionState: () => [
        null,
        () => {
          submissions++;
        },
      ],
    },
    "react/jsx-runtime": jsx,
    "@/contexts": {
      useProduct: () => context,
      useCart: () => ({
        state: { items: {} },
        addCartItem: () => {
          submissions++;
        },
      }),
    },
    "next-intl": {
      useTranslations: () => (key: string) => key,
      useLocale: () => "en",
    },
    "lucide-react": {},
    "../buttons/button": { __esModule: true, default: () => null },
    "@/lib/constants": { DEFAULT_CANVAS_IMAGE },
    "@/contexts/cart-context/utils": {
      getAttributes: () => [],
      toProductState: () => ({}),
    },
  };
  const add = loadModule<any>("src/components/product/add-to-cart.tsx", {
    ...common,
    "next/navigation": { useRouter: () => ({}) },
    "../../lib/utils/cart-actions": {
      addItem: () => {
        submissions++;
      },
    },
    "@/lib/s3/actions/image": {},
    "@/contexts/product-context/utils": {},
  }).default();
  assert.equal(add.props.children[0].props.disabled, true);
  add.props.onSubmit({ preventDefault() {} });
  const save = loadModule<any>("src/components/product/save-cart-item.tsx", {
    ...common,
    "@/lib/utils/cart-actions": {},
    "../buttons": { ButtonLink: "a" },
  }).default({ cartItemID: "existing-item" });
  assert.equal(save.props.children[0].props.children[0].props.disabled, true);
  await save.props.children[0].props.action();
  assert.equal(submissions, 0);
  const total = loadModule<any>("src/components/product/product-total.tsx", {
    ...common,
    "./price": {
      default: () => {
        throw new Error("Invalid price rendered");
      },
      __esModule: true,
    },
  }).default;
  assert.match(
    renderToStaticMarkup(React.createElement(total)),
    /selectionUnavailable/
  );
});

test("the margin placeholder cannot be selected as a product option", () => {
  const Selector = loadModule<any>(
    "src/components/product/variantSelectors/variant-selector.tsx",
    {
      react: React,
      "react/jsx-runtime": jsx,
      "@/contexts": {
        useProduct: () => ({ state: { size: "40x60", margin: "with" } }),
      },
      "@/contexts/product-context/data": data,
      "next-intl": { useTranslations: () => (key: string) => key },
      "../price": { default: () => null, __esModule: true },
    }
  ).default;
  const html = renderToStaticMarkup(
    React.createElement(Selector, {
      option: product.options[1],
      options: product.options,
      variants,
    })
  );
  assert.match(html, /<select[^>]*required/);
  assert.match(html, /<option value="" disabled/);
});
