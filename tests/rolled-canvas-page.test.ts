import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const route = readFileSync(
  join(root, "src/app/[locale]/product/[handle]/page.tsx"),
  "utf8"
);
const page = readFileSync(
  join(root, "src/components/product/rolled-canvas-product-page.tsx"),
  "utf8"
);
const configurator = readFileSync(
  join(root, "src/components/product/rolled-canvas-configurator.tsx"),
  "utf8"
);
const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8"));
const fr = JSON.parse(readFileSync(join(root, "messages/fr.json"), "utf8"));

test("rolled canvas is routed to the premium product experience", () => {
  assert.match(
    route,
    /product\.handle === "rolled-canvas-prints"[\s\S]*?<RolledCanvasProductPage/
  );
  for (const expected of [
    "RolledCanvasStudioPreview",
    "RolledCanvasConfigurator",
    "RolledBuyingGuide",
    "CanvasTrustedBy",
    "CanvasComparison",
    "CanvasReviews",
  ]) {
    assert.match(page, new RegExp(expected));
  }
});

test("rolled experience does not inherit stretched-only controls or claims", () => {
  const combined = `${page}\n${configurator}`;
  for (const forbidden of [
    "\\bCanvasConfigurator\\b",
    "\\bCanvasStudioPreview\\b",
    "/canvas-stretching.jpeg",
    'studio("readyToHang")',
    'p("frame.title")',
    't("edgeTitle")',
    '"depthDifference"',
  ]) {
    assert.doesNotMatch(combined, new RegExp(forbidden));
  }
});

test("rolled editorial copy stays aligned in English and French", () => {
  assert.deepEqual(
    Object.keys(en.Product.rollsPage.studio).sort(),
    Object.keys(fr.Product.rollsPage.studio).sort()
  );
  for (const messages of [en, fr]) {
    const studio = messages.Product.rollsPage.studio;
    for (const key of [
      "eyebrow",
      "arrivalNote",
      "previewHelp",
      "customPreviewAlt",
    ]) {
      assert.equal(typeof studio[key], "string", `studio.${key} missing`);
    }
    assert.equal(typeof studio.gallery.product, "string");
    assert.equal(typeof studio.assurances.margin, "string");
    assert.equal(typeof studio.craft.imageAlt, "string");
    assert.equal(typeof studio.details.guaranteeLink, "string");
  }
});
