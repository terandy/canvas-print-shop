import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { Client } from "pg";
import * as orm from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/lib/db/schema";
import { loadModule } from "./helpers/load-module";
import { createElement } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { createTranslator } from "next-intl";
import en from "../messages/en.json";
import fr from "../messages/fr.json";

function queries(db: unknown) {
  return loadModule<typeof import("../src/lib/db/queries/admin-carts")>(
    "src/lib/db/queries/admin-carts.ts",
    { "drizzle-orm": orm, "../index": { db }, "../schema": schema }
  );
}

test("cart page input cannot produce a negative or overflowing offset", () => {
  const { parseCartPage } = queries({});
  for (const value of [
    undefined,
    "",
    "0",
    "-1",
    "1.5",
    "bad",
    "Infinity",
    "9999999999999999",
  ])
    assert.equal(parseCartPage(value), 1);
  assert.equal(parseCartPage("2"), 2);
});

test("cart pagination renders valid links and translated controls in both languages", async () => {
  for (const locale of ["en", "fr"] as const) {
    for (const [page, hasNextPage] of [
      [1, true],
      [2, false],
      [1, false],
    ] as const) {
      const { default: Page } = loadModule<
        typeof import("../src/app/[locale]/admin/carts/page")
      >("src/app/[locale]/admin/carts/page.tsx", {
        "react/jsx-runtime": jsxRuntime,
        "next/link": ({ children, ...props }: any) =>
          createElement("a", props, children),
        "next-intl/server": {
          getTranslations: async () =>
            createTranslator({
              locale,
              namespace: "Admin",
              messages: locale === "en" ? en : fr,
            }),
        },
        "@/lib/db/queries/admin-carts": {
          parseCartPage: queries({}).parseCartPage,
          getActiveCarts: async (actualPage: number) => {
            assert.equal(actualPage, page);
            return { carts: [], hasNextPage };
          },
        },
      });
      const html = renderToStaticMarkup(
        await Page({ searchParams: Promise.resolve({ page: String(page) }) })
      );
      assert.equal(html.includes("<nav"), page > 1 || hasNextPage);
      assert.equal(html.includes('href="?page=2"'), hasNextPage);
      assert.equal(html.includes('href="?page=1"'), page > 1);
      assert.equal(html.includes('href="?page=0"'), false);
      if (hasNextPage)
        assert.ok(html.includes(locale === "en" ? "Next" : "Suivant"));
      if (page > 1)
        assert.ok(html.includes(locale === "en" ? "Previous" : "Précédent"));
    }
  }
});

const url = process.env.CPS_TEST_DATABASE_URL;

test(
  "active carts use one query per page despite thousands of empty carts, with complete items and stable pagination",
  { skip: !url },
  async () => {
    const parsed = new URL(url!);
    assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname));
    assert.equal(parsed.pathname, "/cps_regression");
    const client = new Client({ connectionString: url });
    const testSchema = `carts_test_${randomUUID().replaceAll("-", "")}`;
    await client.connect();
    try {
      await client.query(`CREATE SCHEMA "${testSchema}"`);
      await client.query(`SET search_path TO "${testSchema}"`);
      await client.query(
        readFileSync(
          "drizzle/0000_eminent_major_mapleleaf.sql",
          "utf8"
        ).replaceAll('"public".', `"${testSchema}".`)
      );
      const product = (
        await client.query(
          "INSERT INTO products (handle,title_en) VALUES ('canvas-test','Canvas') RETURNING id"
        )
      ).rows[0];
      const variant = (
        await client.query(
          "INSERT INTO product_variants (product_id,title,price_cents,options) VALUES ($1,'16x24',12500,'{}') RETURNING id",
          [product.id]
        )
      ).rows[0];
      const customer = (
        await client.query(
          "INSERT INTO customers (email,first_name,last_name) VALUES ('buyer@example.test','Test','Buyer') RETURNING id"
        )
      ).rows[0];

      // Newer empty carts must not fill a page before populated carts are found.
      await client.query(
        "INSERT INTO carts (updated_at) SELECT now() FROM generate_series(1,2800)"
      );
      const populated = (
        await client.query(
          "INSERT INTO carts (customer_id,updated_at) SELECT CASE WHEN n=1 THEN $1::uuid ELSE NULL END, '2026-10-01'::timestamp FROM generate_series(1,103) n RETURNING id",
          [customer.id]
        )
      ).rows
        .map((row) => row.id)
        .sort()
        .reverse();
      await client.query(
        "INSERT INTO cart_items (cart_id,variant_id,quantity) SELECT id,$1,2 FROM carts WHERE id=ANY($2::uuid[])",
        [variant.id, populated]
      );
      // Keep all lines for a cart, including multiple configurations of a variant.
      await client.query(
        "INSERT INTO cart_items (cart_id,variant_id,quantity,attributes) VALUES ($1,$2,3,$3)",
        [
          populated[49],
          variant.id,
          { imageUrl: "https://example.test/photo.jpg" },
        ]
      );
      const converted = (
        await client.query(
          "INSERT INTO carts (status) VALUES ('converted') RETURNING id"
        )
      ).rows[0];
      await client.query(
        "INSERT INTO cart_items (cart_id,variant_id) VALUES ($1,$2)",
        [converted.id, variant.id]
      );

      let queryCount = 0;
      const { getActiveCarts } = queries(
        drizzle(client, {
          schema,
          logger: {
            logQuery() {
              queryCount++;
            },
          },
        })
      );
      const first = await getActiveCarts(1);
      assert.equal(queryCount, 1);
      assert.deepEqual(
        first.carts.map((cart) => cart.id),
        populated.slice(0, 50)
      );
      assert.equal(first.hasNextPage, true);
      assert.equal(first.carts[49].items.length, 2);
      assert.equal(first.carts[49].itemCount, 5);
      assert.equal(first.carts[49].totalCents, 62500);
      assert.ok(
        first.carts[49].items.some(
          (item) => item.imageUrl === "https://example.test/photo.jpg"
        )
      );

      const second = await getActiveCarts(2);
      const third = await getActiveCarts(3);
      assert.equal(queryCount, 3);
      assert.equal(second.hasNextPage, true);
      assert.equal(third.hasNextPage, false);
      assert.deepEqual(
        [...first.carts, ...second.carts, ...third.carts].map(
          (cart) => cart.id
        ),
        populated
      );
      const named = [...first.carts, ...second.carts, ...third.carts].find(
        (cart) => cart.customerEmail
      );
      assert.equal(named?.customerName, "Test Buyer");
      assert.equal(named?.customerEmail, "buyer@example.test");
      assert.ok(
        first.carts.some(
          (cart) => cart.customerEmail === null && cart.customerName === null
        )
      );
      assert.deepEqual(await getActiveCarts(4), {
        carts: [],
        hasNextPage: false,
      });
    } finally {
      await client.query(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE`);
      await client.end();
    }
  }
);
