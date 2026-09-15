import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { Client } from "pg";
import { PRICES, syncRolledCanvas } from "../scripts/seed-rolled-canvas";

test("seed dry run does not connect to a database or load production credentials", () => {
  const output = execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/seed-rolled-canvas.ts"],
    {
      encoding: "utf8",
      timeout: 10000,
      env: {
        ...process.env,
        POSTGRES_URL: "postgres://invalid:invalid@127.0.0.1:1/does_not_exist",
      },
    }
  );
  assert.match(output, /DRY RUN — no database connection/);
  assert.match(output, /32 variants/);
});

const url = process.env.CPS_TEST_DATABASE_URL;

test(
  "seed preserves references, handles concurrent reruns, and rolls back all changes on failure",
  { skip: !url },
  async () => {
    // Deliberately separate from POSTGRES_URL / .env.local. Never run this fixture
    // against an externally hosted database, even if a URL is pasted by mistake.
    const parsed = new URL(url!);
    assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname));
    assert.equal(parsed.pathname, "/cps_regression");
    const client = new Client({ connectionString: url });
    const second = new Client({ connectionString: url });
    const schema = `seed_test_${randomUUID().replaceAll("-", "")}`;
    await client.connect();
    try {
      await client.query(`CREATE SCHEMA "${schema}"`);
      await client.query(`SET search_path TO "${schema}"`);
      // Use the repository's actual tables and foreign-key actions.
      await client.query(
        readFileSync(
          "drizzle/0000_eminent_major_mapleleaf.sql",
          "utf8"
        ).replaceAll('"public".', `"${schema}".`)
      );
      const product = (
        await client.query(
          `INSERT INTO products (handle, title_en, seo_title_en, is_active) VALUES ('rolled-canvas-prints', 'Approved copy', 'Approved SEO', false) RETURNING *`
        )
      ).rows[0];
      assert.deepEqual(await syncRolledCanvas(client), {
        inserted: 32,
        updated: 0,
      });
      const before = (
        await client.query("SELECT * FROM product_variants ORDER BY id")
      ).rows;
      const small = before.find(
        (v) => v.options.size === "8x10" && v.options.margin === "with"
      );
      const cart = (
        await client.query("INSERT INTO carts DEFAULT VALUES RETURNING id")
      ).rows[0];
      await client.query(
        "INSERT INTO cart_items (cart_id, variant_id, quantity, attributes) VALUES ($1, $2, 2, $3)",
        [cart.id, small.id, { imageUrl: "https://example.test/photo.jpg" }]
      );
      const order = (
        await client.query(
          "INSERT INTO orders (subtotal_cents, total_cents, customer_email) VALUES (3000, 3000, 'buyer@example.test') RETURNING id"
        )
      ).rows[0];
      await client.query(
        "INSERT INTO order_items (order_id, variant_id, product_handle, product_title, variant_title, quantity, price_cents, selected_options) VALUES ($1, $2, 'rolled-canvas-prints', 'Rolled', '8x10 / margin', 1, 3000, $3)",
        [order.id, small.id, small.options]
      );
      const cartBefore = (await client.query("SELECT * FROM cart_items")).rows;
      const ordersBefore = (await client.query("SELECT * FROM order_items"))
        .rows;
      await client.query(
        "UPDATE product_variants SET price_cents = 1, available_for_sale = false WHERE id = $1",
        [small.id]
      );

      assert.deepEqual(await syncRolledCanvas(client), {
        inserted: 0,
        updated: 32,
      });
      const after = (
        await client.query("SELECT * FROM product_variants ORDER BY id")
      ).rows;
      assert.deepEqual(
        after.map((v) => v.id),
        before.map((v) => v.id)
      );
      assert.equal(
        after.find((v) => v.id === small.id).price_cents,
        PRICES["8x10"]
      );
      assert.equal(
        after.find((v) => v.id === small.id).available_for_sale,
        false
      );
      assert.deepEqual(
        (await client.query("SELECT * FROM cart_items")).rows,
        cartBefore
      );
      assert.deepEqual(
        (await client.query("SELECT * FROM order_items")).rows,
        ordersBefore
      );
      const unchangedProduct = (
        await client.query("SELECT * FROM products WHERE id = $1", [product.id])
      ).rows[0];
      assert.equal(unchangedProduct.title_en, "Approved copy");
      assert.equal(unchangedProduct.seo_title_en, "Approved SEO");
      assert.equal(unchangedProduct.is_active, false);

      // A missing variant is inserted exactly once even under concurrent runs.
      const unreferenced = after.find((v) => v.id !== small.id);
      await client.query("DELETE FROM product_variants WHERE id = $1", [
        unreferenced.id,
      ]);
      await second.connect();
      await second.query(`SET search_path TO "${schema}"`);
      const concurrent = await Promise.all([
        syncRolledCanvas(client),
        syncRolledCanvas(second),
      ]);
      assert.equal(
        concurrent.reduce((sum, r) => sum + r.inserted, 0),
        1
      );
      assert.equal(
        (
          await client.query(
            "SELECT count(*)::int AS count FROM product_variants"
          )
        ).rows[0].count,
        32
      );

      // Force a genuine SQL failure part-way through the script, after option
      // and early price updates, and check that PostgreSQL rolls them all back.
      await client.query(
        "UPDATE product_options SET \"values\" = ARRAY['old'] WHERE name = 'margin'"
      );
      await client.query(
        "UPDATE product_variants SET price_cents = 1234 WHERE id = $1",
        [small.id]
      );
      await client.query(
        `CREATE FUNCTION fail_large_price() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.options->>'size' = '40x60' THEN RAISE EXCEPTION 'Synthetic seed failure'; END IF; RETURN NEW; END $$`
      );
      await client.query(
        "CREATE TRIGGER reject_large BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION fail_large_price()"
      );
      await assert.rejects(syncRolledCanvas(client), /Synthetic seed failure/);
      assert.equal(
        (
          await client.query(
            "SELECT price_cents FROM product_variants WHERE id = $1",
            [small.id]
          )
        ).rows[0].price_cents,
        1234
      );
      assert.deepEqual(
        (
          await client.query(
            "SELECT \"values\" FROM product_options WHERE name = 'margin'"
          )
        ).rows[0].values,
        ["old"]
      );
      assert.deepEqual(
        (await client.query("SELECT * FROM cart_items")).rows,
        cartBefore
      );
      assert.deepEqual(
        (await client.query("SELECT * FROM order_items")).rows,
        ordersBefore
      );
    } finally {
      await second.end();
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await client.end();
    }
  }
);
