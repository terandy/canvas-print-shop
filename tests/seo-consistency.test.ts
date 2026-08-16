import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  BUSINESS_DATA,
  MONTREAL_LOCATION_ID,
  ORGANIZATION_ID,
  QUEBEC_CITY_LOCATION_ID,
  SHOP_REVIEWS,
  getLocationAddressLines,
  getOnlineSizeValues,
} from "../src/lib/business-data";
import {
  buildBusinessEntityGraph,
  buildMontrealWebPageStructuredData,
  buildProductStructuredData,
} from "../src/lib/structured-data";
import {
  ACCEPTED_IMAGE_FORMAT_LABELS,
  DISPLAYABLE_IMAGE_TYPES,
  HEIC_IMAGE_TYPES,
  formatAcceptedImageFormats,
} from "../src/lib/images/formats";
import { canonicalMetadata } from "../src/lib/seo";
import robots from "../src/app/robots";
import type { Product } from "../src/types/product";

type JsonObject = Record<string, unknown>;

const root = process.cwd();
const en = JSON.parse(
  readFileSync(path.join(root, "messages/en.json"), "utf8")
);
const fr = JSON.parse(
  readFileSync(path.join(root, "messages/fr.json"), "utf8")
);

const strings = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(strings);
  }
  return [];
};

const product: Product = {
  id: "canvas",
  handle: "canvas",
  title: "Custom Canvas",
  description: "Made to order",
  descriptionHtml: "<p>Made to order</p>",
  featuredImage: {
    url: "https://example.com/canvas.jpg",
    altText: "Canvas",
  },
  images: [],
  seo: { title: "Custom Canvas", description: "Made to order" },
  tags: [],
  options: [
    { name: "size", values: ["8x10", "36x48", "40x60"], affectsPrice: true },
  ],
  variants: [
    {
      id: "available",
      sku: null,
      title: "8x10",
      priceCents: 4900,
      price: { amount: "49.00", currencyCode: "CAD" },
      availableForSale: true,
      options: { size: "8x10" },
    },
    {
      id: "unavailable",
      sku: null,
      title: "40x60",
      priceCents: 39900,
      price: { amount: "399.00", currencyCode: "CAD" },
      availableForSale: false,
      options: { size: "40x60" },
    },
  ],
  priceRange: {
    minVariantPrice: { amount: "49.00", currencyCode: "CAD" },
    maxVariantPrice: { amount: "399.00", currencyCode: "CAD" },
  },
  updatedAt: "2026-08-15T00:00:00.000Z",
};

test("central business data separates the two verified physical entities", () => {
  const { quebecCityWorkshop, montrealBranch } = BUSINESS_DATA.locations;

  assert.equal(quebecCityWorkshop.productionLocation, true);
  assert.equal(quebecCityWorkshop.localPickup, true);
  assert.equal(montrealBranch.name, "Canvas Print Shop Montreal");
  assert.equal(montrealBranch.address.streetAddress, "1350 Rue Mazurette");
  assert.equal(montrealBranch.address.postalCode, "H4N 1H2");
  assert.equal(montrealBranch.productionLocation, null);
  assert.equal(montrealBranch.localPickup, null);
  assert.notEqual(quebecCityWorkshop.id, montrealBranch.id);
  assert.deepEqual(
    BUSINESS_DATA.deliveryCoverage.regions.map(({ code }) => code),
    ["QC", "ON"]
  );
});

test("Montreal address lines are exact and localized without inventing fields", () => {
  const location = BUSINESS_DATA.locations.montrealBranch;
  assert.deepEqual(getLocationAddressLines(location, "en"), [
    "1350 Rue Mazurette",
    "Montreal, Quebec H4N 1H2",
    "Canada",
  ]);
  assert.deepEqual(getLocationAddressLines(location, "fr"), [
    "1350, rue Mazurette",
    "Montréal (Québec) H4N 1H2",
    "Canada",
  ]);
  for (const field of ["email", "telephone", "mapUrl", "openingHours"]) {
    assert.equal(field in location, false);
  }
});

test("business JSON-LD has one organization and two distinct locations", () => {
  const data = buildBusinessEntityGraph();
  const graph = data["@graph"] as JsonObject[];
  const organization = graph.find((node) => node["@id"] === ORGANIZATION_ID);
  const locations = graph.filter((node) => node["@type"] === "LocalBusiness");
  const montreal = locations.find(
    (node) => node["@id"] === MONTREAL_LOCATION_ID
  )!;

  assert.ok(organization);
  assert.equal(locations.length, 2);
  assert.ok(locations.some((node) => node["@id"] === QUEBEC_CITY_LOCATION_ID));
  assert.deepEqual(
    (montreal.address as JsonObject).streetAddress,
    "1350 Rue Mazurette"
  );
  assert.deepEqual((montreal.address as JsonObject).postalCode, "H4N 1H2");
  for (const field of [
    "email",
    "telephone",
    "hasMap",
    "geo",
    "openingHoursSpecification",
  ]) {
    assert.equal(field in montreal, false);
  }
  assert.equal(
    (organization!.hasMerchantReturnPolicy as JsonObject).merchantReturnDays,
    30
  );
});

test("Montreal pages reference the same language-neutral business entity", () => {
  const english = buildMontrealWebPageStructuredData(
    "en",
    "Montreal",
    "English"
  );
  const french = buildMontrealWebPageStructuredData(
    "fr",
    "Montréal",
    "Français"
  );
  assert.deepEqual(
    (english.mainEntity as JsonObject)["@id"],
    MONTREAL_LOCATION_ID
  );
  assert.deepEqual(
    (french.mainEntity as JsonObject)["@id"],
    MONTREAL_LOCATION_ID
  );
  assert.equal(english.inLanguage, "en-CA");
  assert.equal(french.inLanguage, "fr-CA");
});

test("visible review source is 4.8 out of 5 from 10 general shop reviews", () => {
  const calculated =
    SHOP_REVIEWS.reduce((total, review) => total + review.rating, 0) /
    SHOP_REVIEWS.length;
  assert.equal(calculated, 4.8);
  assert.equal(BUSINESS_DATA.reviews.ratingValue, calculated);
  assert.equal(BUSINESS_DATA.reviews.reviewCount, 10);
  assert.equal(BUSINESS_DATA.reviews.productStructuredDataEligible, false);
  assert.match(en.Product.averageRating, /out of 5/);
  assert.match(fr.Product.averageRating, /sur 5/);
});

test("Product JSON-LD matches live product data and omits ineligible rating", () => {
  const data = buildProductStructuredData(product, "en");
  const offer = data.offers as JsonObject;
  const destination = (offer.shippingDetails as JsonObject)
    .shippingDestination as JsonObject[];

  assert.equal(data.aggregateRating, undefined);
  assert.equal(offer.lowPrice, "49.00");
  assert.equal(offer.highPrice, "399.00");
  assert.equal(offer.priceCurrency, "CAD");
  assert.equal(offer.offerCount, 1);
  assert.equal(offer.availability, "https://schema.org/InStock");
  assert.deepEqual(destination[0].addressRegion, ["QC", "ON"]);
});

test("any eligible Product aggregateRating is explicitly five-point", () => {
  const data = buildProductStructuredData(product, "en", {
    ratingValue: 4.8,
    reviewCount: 10,
    bestRating: 5,
    worstRating: 1,
    productStructuredDataEligible: true,
  });
  const rating = data.aggregateRating as JsonObject;
  assert.equal(rating.ratingValue, 4.8);
  assert.equal(rating.reviewCount, 10);
  assert.equal(rating.bestRating, 5);
  assert.equal(rating.worstRating, 1);
});

test("online sizes and marketing format labels derive from operational data", () => {
  assert.deepEqual(getOnlineSizeValues(product), ["8x10", "36x48", "40x60"]);
  assert.deepEqual(ACCEPTED_IMAGE_FORMAT_LABELS, [
    "JPG",
    "JPEG",
    "PNG",
    "WebP",
    "AVIF",
    "GIF",
    "HEIC",
    "HEIF",
  ]);
  assert.equal(DISPLAYABLE_IMAGE_TYPES.length + HEIC_IMAGE_TYPES.length, 9);
  assert.match(formatAcceptedImageFormats("en-CA"), /HEIF/);
  assert.match(formatAcceptedImageFormats("fr-CA"), /HEIF/);
  assert.equal(
    en.ImageUploader.dropzone.supportedFormats,
    "Supported formats: {formats}"
  );
  assert.equal(
    fr.ImageUploader.dropzone.supportedFormats,
    "Formats pris en charge : {formats}"
  );
});

test("content contains no prohibited delivery, maximum-size, rating or French phrases", () => {
  const all = [...strings(en), ...strings(fr)].join("\n");
  const prohibited = [
    /serving customers nationwide/i,
    /servant les clients à travers le pays/i,
    /36x48 is our largest standard size/i,
    /36x48 as standard\. Larger/i,
    /le 36x48 est notre plus grand format standard/i,
    /le 36x48 en standard/i,
    /large custom canvas prints up to 36x48/i,
    /grands canevas jusqu'à 36x48/i,
    /2-3 business days/i,
    /2-3 jours ouvrables/i,
    /4[,.]8 (?:out of|sur) 10/i,
    /expertes fabriquées/i,
    /Toile mélange coton premium/i,
    /Impressions écologiques, sans odeur parfaites/i,
    /Aucun image/i,
    /Telephone/i,
  ];
  for (const pattern of prohibited) assert.doesNotMatch(all, pattern);
});

test("Montreal canonical and hreflang alternates remain reciprocal", () => {
  const enMetadata = canonicalMetadata("en", "/canvas-prints/montreal");
  const frMetadata = canonicalMetadata("fr", "/canvas-prints/montreal");
  assert.equal(
    enMetadata.alternates?.canonical,
    "https://canvasprintshop.ca/en/canvas-prints/montreal"
  );
  assert.equal(
    frMetadata.alternates?.canonical,
    "https://canvasprintshop.ca/fr/canvas-prints/montreal"
  );
  assert.equal(
    enMetadata.alternates?.languages?.["fr-CA"],
    "https://canvasprintshop.ca/fr/canvas-prints/montreal"
  );
  assert.equal(
    frMetadata.alternates?.languages?.["en-CA"],
    "https://canvasprintshop.ca/en/canvas-prints/montreal"
  );
});

test("robots and llms.txt keep public commercial content crawlable", () => {
  const policy = robots();
  const rules = policy.rules as {
    userAgent: string;
    allow: string;
    disallow: string[];
  }[];
  const llms = readFileSync(path.join(root, "public/llms.txt"), "utf8");
  assert.equal(rules[0].userAgent, "*");
  assert.equal(rules[0].allow, "/");
  assert.ok(!rules[0].disallow.includes("/llms.txt"));
  assert.match(llms, /1350 Rue Mazurette/);
  assert.match(llms, /There is no fixed maximum custom canvas size/);
  assert.doesNotMatch(
    readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8"),
    /llms\.txt/
  );
});

test("all required commercial routes still exist", () => {
  const routes = [
    "src/app/[locale]/page.tsx",
    "src/app/[locale]/product/[handle]/page.tsx",
    "src/app/[locale]/canvas-prints/[slug]/page.tsx",
    "src/app/[locale]/faqs/page.tsx",
    "src/app/[locale]/shipping-policy/page.tsx",
    "src/app/[locale]/returns-policy/page.tsx",
    "src/app/[locale]/quality-guarantee/page.tsx",
    "src/app/[locale]/how-we-make-our-canvas-prints/page.tsx",
  ];
  for (const route of routes)
    assert.ok(existsSync(path.join(root, route)), route);
});
