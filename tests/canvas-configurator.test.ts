import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import * as jsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { loadModule } from "./helpers/load-module";
import { getSelectedVariant } from "../src/contexts/product-context/utils";
import {
  depthForFrame,
  INITIAL_FORM_STATE,
} from "../src/contexts/product-context/data";
import { DEFAULT_CANVAS_IMAGE, EMAIL } from "../src/lib/constants";
import type { Product } from "../src/types/product";

const product: Pick<Product, "options" | "variants"> = {
  options: [
    { name: "size", values: ["8x10", "40x60"], affectsPrice: true },
    { name: "frame", values: ["none", "black"], affectsPrice: true },
    { name: "depth", values: ["regular", "gallery"], affectsPrice: true },
  ],
  variants: [
    ["8x10", "none", "55.00"],
    ["8x10", "black", "105.00"],
    ["40x60", "none", "400.00"],
    ["40x60", "black", "555.00"],
  ].map(([size, frame, amount]) => ({
    id: `${size}-${frame}`,
    sku: null,
    title: `${size} / ${frame}`,
    priceCents: Math.round(Number(amount) * 100),
    options: { size, frame, depth: depthForFrame(frame) },
    availableForSale: true,
    price: { amount, currencyCode: "CAD" },
  })),
};

function render({ frame = "none", unavailable = false, editing = false } = {}) {
  const fixture = unavailable
    ? {
        ...product,
        variants: product.variants.map((variant) => ({
          ...variant,
          availableForSale: false,
        })),
      }
    : product;
  const Component = loadModule<{ default: React.ComponentType }>(
    "src/components/product/canvas-configurator.tsx",
    {
      react: React,
      "react/jsx-runtime": jsx,
      "next/image": {
        __esModule: true,
        default: ({ src, alt }: { src: string; alt: string }) =>
          React.createElement("img", { src, alt }),
      },
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
          product: fixture,
          state: { ...INITIAL_FORM_STATE, frame, depth: depthForFrame(frame) },
          cartItemID: editing ? "existing-item" : null,
        }),
      },
      "@/contexts/product-context/data": { depthForFrame },
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

test("size choices show the full price for the selected finish", () => {
  const unframed = render();
  const framed = render({ frame: "black" });
  assert.match(unframed, /40″ × 60″ — \$400\.00/);
  assert.match(framed, /40″ × 60″ — \$555\.00/);
  assert.match(framed, /8″ × 10″ — \$105\.00/);
  assert.match(unframed, /\+\$50\.00/);
  assert.match(framed, /\+\$50\.00/);
});

test("unavailable variants cannot be selected or display invented prices", () => {
  const html = render({ unavailable: true });
  assert.match(html, /<option value="40x60" disabled=""/);
  assert.match(html, /disabled=""[^>]*>[\s\S]*blackFrame/);
  assert.doesNotMatch(html, /\$|NaN/);
});

test("the configurator exposes labelled controls and preserves cart editing", () => {
  const html = render();
  assert.match(html, /for="canvas-size"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /href="#canvas-upload"/);
  assert.ok(html.indexOf('type="file"') < html.indexOf('id="canvas-size"'));
  assert.match(html, />Add<\/button>/);
  const editing = render({ editing: true });
  assert.match(editing, />Save<\/button>/);
  assert.doesNotMatch(editing, />Add<\/button>/);
});
