/** Unpaid smoke test. Uses real hosted checkout code and Stripe with a synthetic
 * cart; never accesses the database or accepts a payment. Expire all sessions
 * on exit. Live keys require --allow-live-unpaid. */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { build } from "esbuild";
import { config } from "dotenv";
import Stripe from "stripe";
import { createTranslator } from "next-intl";
import { BUSINESS_DATA } from "../src/lib/business-data";
import * as pricing from "../src/lib/shipping/pricing";
import * as validation from "../src/lib/shipping/hosted-checkout";
import { checkoutErrorDetails } from "../src/lib/stripe/errors";
import { loadModule } from "../tests/helpers/load-module";
import { hostedCart as cart } from "../tests/fixtures/hosted-cart";
import en from "../messages/en.json";
import fr from "../messages/fr.json";

async function main() {
  config({ path: process.env.CHECKOUT_ENV_FILE || ".env.local", quiet: true });
  const key = process.env.STRIPE_SECRET_KEY;
  if (
    !key ||
    (!key.startsWith("sk_test_") &&
      !process.argv.includes("--allow-live-unpaid"))
  )
    throw new Error("Test keys required unless --allow-live-unpaid is passed");
  const api = new Stripe(key, {
    apiVersion: "2025-12-15.clover" as Stripe.LatestApiVersion,
  });
  const sessions: string[] = [];
  const getTranslations = async ({
    locale,
    namespace,
  }: {
    locale: string;
    namespace: string;
  }) =>
    createTranslator({
      locale,
      namespace: namespace as any,
      messages: locale === "fr" ? fr : en,
    });
  const stripe = {
    checkout: {
      sessions: {
        create: async (input: Stripe.Checkout.SessionCreateParams) => {
          const session = await api.checkout.sessions.create(input);
          sessions.push(session.id);
          console.log("Created unpaid hosted session", {
            total: session.amount_total,
            shipping: session.total_details?.amount_shipping,
            flow: session.ui_mode,
            locale: session.locale,
          });
          return session;
        },
        retrieve: api.checkout.sessions.retrieve.bind(api.checkout.sessions),
      },
    },
  };
  const dependencies = {
    "next-intl/server": { getTranslations },
    "node:crypto": { createHash },
    "./index": { stripe },
    "@/lib/db/queries/carts": { getCart: async () => cart },
    "@/lib/constants": { BASE_URL: "http://localhost:3400" },
    "@/lib/business-data": { BUSINESS_DATA },
    "@/lib/shipping/pricing": pricing,
    "@/lib/shipping/hosted-checkout": validation,
  };
  const checkout = loadModule<typeof import("../src/lib/stripe/checkout")>(
    "src/lib/stripe/checkout.ts",
    dependencies
  );
  const hosted = loadModule<typeof import("../src/lib/stripe/hosted-checkout")>(
    "src/lib/stripe/hosted-checkout.ts",
    { ...dependencies, "./checkout": checkout }
  );
  const summary = hosted.getHostedCheckoutSummary(cart);
  function actions(locale: string) {
    return loadModule<
      typeof import("../src/lib/utils/hosted-checkout-actions")
    >("src/lib/utils/hosted-checkout-actions.ts", {
      "next/headers": {
        cookies: async () => ({ get: () => ({ value: cart.id }) }),
      },
      "next-intl/server": { getLocale: async () => locale },
      "@/lib/shipping/hosted-checkout": validation,
      "@/lib/stripe/hosted-checkout": hosted,
      "@/lib/stripe/errors": { checkoutErrorDetails },
    });
  }
  const bundle = await build({
    stdin: {
      contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {NextIntlClientProvider} from 'next-intl'; import Checkout from './src/components/checkout/hosted-checkout'; import en from './messages/en.json'; import fr from './messages/fr.json'; const locale=location.pathname.startsWith('/fr')?'fr':'en'; createRoot(document.getElementById('root')).render(<NextIntlClientProvider locale={locale} messages={locale==='fr'?fr:en}><Checkout summary={${JSON.stringify(summary)}} /></NextIntlClientProvider>);`,
      loader: "tsx",
      resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    define: {
      "process.env.NODE_ENV": '"development"',
      "process.env.NEXT_PUBLIC_BASE_URL": '"https://canvasprintshop.ca"',
    },
    plugins: [
      {
        name: "isolated-actions",
        setup(builder) {
          builder.onResolve(
            { filter: /^@\/lib\/utils\/hosted-checkout-actions$/ },
            () => ({ path: "actions", namespace: "fixture" })
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
            contents: `export async function startHostedCheckout(input,fingerprint){const r=await fetch('/create?locale='+(location.pathname.startsWith('/fr')?'fr':'en'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input,fingerprint})});return r.json();}`,
            loader: "js",
          }));
        },
      },
    ],
  });
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", "http://localhost:3400");
    if (req.method === "GET") {
      if (url.pathname === "/app.js") {
        res.setHeader("Content-Type", "text/javascript");
        res.end(bundle.outputFiles[0].text);
      } else if (url.pathname === "/style.css") {
        res.setHeader("Content-Type", "text/css");
        res.end(readFileSync("/tmp/canvas-hosted-qa.css"));
      } else {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(
          '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body class="bg-neutral-50"><main class="max-w-6xl mx-auto p-5"><p class="mb-5">UNPAID QA — synthetic cart; do not enter card details or pay.</p><div id="root"></div></main><script src="/app.js"></script></body></html>'
        );
      }
      return;
    }
    try {
      if (req.headers.origin !== "http://localhost:3400")
        throw new Error("Invalid origin");
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 10000) throw new Error("Request too large");
      }
      const { input, fingerprint } = JSON.parse(body);
      const result = await actions(
        url.searchParams.get("locale") === "fr" ? "fr" : "en"
      ).startHostedCheckout(input, fingerprint);
      console.log("Hosted action:", result.ok ? "ok" : result.code);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error(checkoutErrorDetails(error));
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, code: "unavailable" }));
    }
  });
  server.listen(3400, "localhost", () =>
    console.log("Unpaid hosted fixture: http://localhost:3400/en")
  );
  async function close() {
    server.close();
    let expired = 0;
    for (const id of sessions) {
      try {
        await api.checkout.sessions.expire(id);
        expired++;
      } catch {
        console.error("Could not expire diagnostic session");
      }
    }
    console.log(
      `Expired ${expired} of ${sessions.length} diagnostic sessions.`
    );
    process.exit();
  }
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}
main().catch((error) => {
  console.error(checkoutErrorDetails(error));
  process.exitCode = 1;
});
