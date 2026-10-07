import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { loadModule } from "./helpers/load-module";

const { NextRequest, NextResponse } = createRequire(import.meta.url)(
  "next/server"
) as typeof import("next/server");

function loadProxy() {
  return loadModule<typeof import("../src/proxy")>("src/proxy.ts", {
    "next/server": { NextRequest, NextResponse },
    "next-intl/middleware":
      () => (request: InstanceType<typeof NextRequest>) => {
        const headers = new Headers(request.headers);
        headers.set(
          "x-next-intl-locale",
          request.nextUrl.pathname.split("/")[1]
        );
        return NextResponse.next({ request: { headers } });
      },
    "./i18n/routing": { routing: { locales: ["en", "fr"] } },
    "./lib/landing-pages": { isValidSlug: (slug: string) => slug === "valid" },
    "./lib/blog": { getPost: (slug: string) => slug === "valid" },
  }).default;
}

test("unknown bilingual slugs rewrite the original origin and preserve locale headers", () => {
  const proxy = loadProxy();
  for (const origin of [
    "http://127.0.0.1:3416",
    "http://localhost:3416",
    "https://canvasprintshop.ca",
  ]) {
    for (const locale of ["en", "fr"]) {
      for (const section of ["blog", "canvas-prints"]) {
        const request = new NextRequest(
          `${origin}/${locale}/${section}/missing?source=regression`
        );
        const response = proxy(request);
        assert.equal(response.status, 404);
        assert.equal(response.headers.get("x-middleware-rewrite"), request.url);
        assert.equal(response.headers.get("x-middleware-next"), null);
        assert.equal(
          response.headers.get("x-middleware-request-x-next-intl-locale"),
          locale
        );
        assert.equal(
          response.headers.get("x-pathname"),
          request.nextUrl.pathname
        );
      }
    }
  }
});

test("valid slugs and checkout keep normal locale routing", () => {
  const proxy = loadProxy();
  for (const path of [
    "/en/blog/valid",
    "/fr/canvas-prints/valid",
    "/fr/checkout",
  ]) {
    const response = proxy(
      new NextRequest(`https://canvasprintshop.ca${path}`)
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-middleware-rewrite"), null);
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
});
