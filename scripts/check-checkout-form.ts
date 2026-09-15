/** Isolated, unpaid browser smoke test of the real checkout component/actions.
 * No database writes or webhook endpoint. Run with Stripe test keys by default;
 * live keys require --allow-live-unpaid. Never enter card details or pay. */
import { createServer } from "node:http";
import { build } from "esbuild";
import { config } from "dotenv";
import Stripe from "stripe";
import { createTranslator } from "next-intl";
import { z } from "zod";
import { BUSINESS_DATA } from "../src/lib/business-data";
import * as pricing from "../src/lib/shipping/pricing";
import { checkoutErrorDetails } from "../src/lib/stripe/errors";
import { loadModule } from "../tests/helpers/load-module";
import en from "../messages/en.json";
import fr from "../messages/fr.json";

async function main() {
  config({ path: ".env.local", quiet: true });
  const key = process.env.STRIPE_SECRET_KEY;
  const publishableKey =
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key || !publishableKey) throw new Error("Stripe keys are missing");
  if (
    !key.startsWith("sk_test_") &&
    !process.argv.includes("--allow-live-unpaid")
  )
    throw new Error(
      "Test keys required unless --allow-live-unpaid is explicitly passed"
    );
  const api = new Stripe(key, {
    apiVersion: "2026-03-25.dahlia" as Stripe.LatestApiVersion,
  });
  const legacyApi = new Stripe(key, {
    apiVersion: "2025-12-15.clover" as Stripe.LatestApiVersion,
  });
  const sessions: string[] = [];
  const cartId = "123e4567-e89b-12d3-a456-426614174000";
  const item = {
    id: "fixture",
    variantId: "fixture",
    productId: "fixture",
    productHandle: "canvas",
    productTitle: "UNPAID QA — framed canvas",
    variantTitle: "30x40",
    quantity: 2,
    priceCents: 10000,
    selectedOptions: { size: "30x40", frame: "black" },
    attributes: {},
  };
  const cart = {
    id: cartId,
    totalQuantity: 5,
    items: [
      item,
      {
        ...item,
        id: "rolled-fixture",
        productHandle: "rolled-canvas-prints",
        productTitle: "UNPAID QA — rolled canvas",
        variantTitle: "16x24",
        quantity: 3,
        selectedOptions: { size: "16x24", frame: "none" },
      },
    ],
  };
  const checkout = loadModule<typeof import("../src/lib/stripe/checkout")>(
    "src/lib/stripe/checkout.ts",
    {
      "next-intl/server": {
        getTranslations: async ({
          locale,
          namespace,
        }: {
          locale: "en" | "fr";
          namespace: string;
        }) =>
          createTranslator({
            locale,
            messages: locale === "fr" ? fr : en,
            namespace: namespace as any,
          }),
      },
      "./index": {
        stripe: legacyApi,
        checkoutStripe: {
          checkout: {
            sessions: {
              create: async (input: Stripe.Checkout.SessionCreateParams) => {
                const session = await api.checkout.sessions.create(input);
                sessions.push(session.id);
                return session;
              },
              retrieve: api.checkout.sessions.retrieve.bind(
                api.checkout.sessions
              ),
              update: api.checkout.sessions.update.bind(api.checkout.sessions),
            },
          },
        },
      },
      "@/lib/db/queries/carts": { getCart: async () => cart },
      "@/lib/constants": { BASE_URL: "http://localhost:3400" },
      "@/lib/business-data": { BUSINESS_DATA },
      "@/lib/shipping/pricing": pricing,
    }
  );
  function actions(locale: string) {
    return loadModule<typeof import("../src/lib/utils/cart-actions")>(
      "src/lib/utils/cart-actions.ts",
      {
        "next/cache": { revalidateTag() {} },
        "next/headers": {
          cookies: async () => ({ get: () => ({ value: cartId }) }),
        },
        "next/navigation": { redirect() {} },
        "next-intl/server": { getLocale: async () => locale },
        zod: { z },
        "../constants": { TAGS: { cart: "cart" } },
        "@/lib/db/queries/carts": { getCart: async () => cart },
        "@/lib/stripe/checkout": checkout,
        "@/lib/shipping/pricing": pricing,
        "@/lib/stripe/errors": { checkoutErrorDetails },
      }
    );
  }
  const bundle = await build({
    stdin: {
      contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {NextIntlClientProvider} from 'next-intl'; import Checkout from './src/components/checkout/embedded-checkout'; import en from './messages/en.json'; import fr from './messages/fr.json'; const locale=location.pathname.startsWith('/fr')?'fr':'en';createRoot(document.getElementById('root')).render(<React.StrictMode><NextIntlClientProvider locale={locale} messages={locale==='fr'?fr:en}><Checkout publishableKey=${JSON.stringify(publishableKey)} /></NextIntlClientProvider></React.StrictMode>);`,
      loader: "tsx",
      resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"development"' },
    plugins: [
      {
        name: "isolated-checkout-actions",
        setup(builder) {
          builder.onResolve(
            { filter: /^@\/lib\/utils\/cart-actions$/ },
            () => ({ path: "actions", namespace: "fixture" })
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
            contents: `const post=async(path,body)=>{const r=await fetch(path+'?locale='+(location.pathname.startsWith('/fr')?'fr':'en'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return r.json();};export const createEmbeddedCheckoutSession=()=>post('/create',{});export const updateEmbeddedCheckoutShipping=(input)=>post('/update',input);`,
            loader: "js",
          }));
        },
      },
    ],
  });
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", "http://localhost:3400");
    if (req.method === "GET" && url.pathname === "/app.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end(bundle.outputFiles[0].text);
      return;
    }
    if (req.method === "GET") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(
        '<html><head><meta name="viewport" content="width=device-width,initial-scale=1" /></head><body style="max-width:700px;margin:30px auto;font-family:sans-serif"><h1>Unpaid checkout verification</h1><p>2 framed 30×40 + 3 rolled 16×24. Shipping: QC $60 / BC $115. Do not enter card details or pay.</p><div id="root"></div><script src="/app.js"></script></body></html>'
      );
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
      const a = actions(url.searchParams.get("locale") === "fr" ? "fr" : "en");
      const result =
        url.pathname === "/create"
          ? await a.createEmbeddedCheckoutSession()
          : await a.updateEmbeddedCheckoutShipping(JSON.parse(body));
      console.log(url.pathname, result.ok ? "ok" : result.code);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error(checkoutErrorDetails(error));
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, code: "checkout-unavailable" }));
    }
  });
  server.listen(3400, "localhost", () =>
    console.log("Unpaid fixture: http://localhost:3400/en — no database writes")
  );
  const close = async () => {
    server.close();
    let expired = 0;
    for (const id of sessions) {
      try {
        const resolved = await checkout.resolveCheckoutShipping(id);
        console.log(
          "Legacy order-reader compatibility:",
          resolved.fulfilmentMethod,
          resolved.shippingAmountCents
        );
      } catch {
        console.error("Could not verify legacy order-reader compatibility");
      }
      try {
        await api.checkout.sessions.expire(id);
        expired += 1;
      } catch {
        console.error("Could not expire a diagnostic session");
      }
    }
    console.log(
      `Expired ${expired} of ${sessions.length} diagnostic sessions.`
    );
    process.exit();
  };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}
void main().catch((error) => {
  console.error(checkoutErrorDetails(error));
  process.exitCode = 1;
});
