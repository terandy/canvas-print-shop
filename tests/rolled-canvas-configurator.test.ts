import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import * as jsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { loadModule } from "./helpers/load-module";
import { getSelectedVariant } from "../src/contexts/product-context/utils";
import { DEFAULT_CANVAS_IMAGE, EMAIL } from "../src/lib/constants";
import type { Product } from "../src/types/product";

const product = {
  handle: "rolled-canvas-prints",
  options: [
    { name: "size", values: ["8x10", "8x12"], affectsPrice: true },
    {
      name: "margin",
      values: ["with", "without"],
      affectsPrice: false,
    },
  ],
  variants: [
    ["8x10", "with", "40.00"],
    ["8x10", "without", "40.00"],
    ["8x12", "with", "45.00"],
    ["8x12", "without", "45.00"],
  ].map(([size, margin, amount]) => ({
    id: `${size}-${margin}`,
    sku: null,
    title: `${size} / ${margin}`,
    priceCents: Math.round(Number(amount) * 100),
    options: { size, margin },
    availableForSale: true,
    price: { amount, currencyCode: "CAD" },
  })),
} as unknown as Product;

function render({ editing = false } = {}) {
  const Component = loadModule<{ default: React.ComponentType }>(
    "src/components/product/rolled-canvas-configurator.tsx",
    {
      react: React,
      "react/jsx-runtime": jsx,
      "lucide-react": {
        Check: () => null,
        ChevronDown: () => null,
        MoveUpRight: () => null,
      },
      "next-intl": {
        useLocale: () => "en",
        useTranslations: () => (key: string) => key,
      },
      "@/contexts": {
        useProduct: () => ({
          product,
          state: {
            size: "8x10",
            margin: "with",
            direction: "landscape",
            borderStyle: "none",
            imgURL: DEFAULT_CANVAS_IMAGE,
          },
          updateField: () => null,
          imgFileUrl: null,
          cartItemID: editing ? "existing-item" : null,
        }),
      },
      "@/contexts/product-context/utils": { getSelectedVariant },
      "@/lib/constants": { DEFAULT_CANVAS_IMAGE, EMAIL },
      "./add-to-cart": {
        __esModule: true,
        default: () => React.createElement("button", null, "Add"),
      },
      "./save-cart-item": {
        __esModule: true,
        default: () => React.createElement("button", null, "Save"),
      },
      "./product-total": { __esModule: true, default: () => null },
      "./image-uploader": {
        __esModule: true,
        default: () => React.createElement("input", { type: "file" }),
      },
      "./image-file": { __esModule: true, default: () => null },
    }
  ).default;
  return renderToStaticMarkup(React.createElement(Component));
}

test("rolled configurator keeps only photo and size as numbered steps", () => {
  const html = render();
  assert.match(html, />01</);
  assert.match(html, />02</);
  assert.doesNotMatch(html, />03</);
  assert.doesNotMatch(html, />04</);
  assert.doesNotMatch(html, /frame\.title|edgeTitle|borderStyle/);
});

test("rolled configurator styles the free margin choice without hiding it", () => {
  const html = render();
  assert.match(html, /for="rolled-canvas-size"/);
  assert.match(html, /id="rolled-margin-help"/);
  assert.match(html, /margin\.with/);
  assert.match(html, /margin\.without/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /8″ × 12″ — \$45\.00/);
  assert.ok(
    html.indexOf('type="file"') < html.indexOf('id="rolled-canvas-size"')
  );
});

test("rolled configurator preserves cart editing", () => {
  assert.match(render(), />Add<\/button>/);
  const editing = render({ editing: true });
  assert.match(editing, />Save<\/button>/);
  assert.doesNotMatch(editing, />Add<\/button>/);
});
