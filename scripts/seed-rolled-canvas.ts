import { CANVAS_SIZES, ROLLED_CANVAS_PRICES_CENTS } from "./canvas-price-model";

/**
 * Reconcile rolled-canvas options and prices without replacing variant IDs.
 *
 *   npx tsx scripts/seed-rolled-canvas.ts          # offline dry run
 *   npx tsx scripts/seed-rolled-canvas.ts --apply  # transaction against configured DB
 *
 * Existing carts/orders, product copy, activation and variant availability are
 * preserved. Missing variants are inserted; retired variants are never deleted.
 */
const HANDLE = "rolled-canvas-prints";

/**
 * Starts from the approved gallery-relative calculation, then applies a strict
 * $5 step for every larger printed area. A rolled print avoids stretcher bars,
 * hand-stretching, hardware and a box, while still carrying the fixed costs of
 * prepress, printing, a protective tube and handling.
 */
export const PRICES = ROLLED_CANVAS_PRICES_CENTS;

/** Order the sizes are offered in, smallest first. Matches the stretched product. */
export const SIZES = [...CANVAS_SIZES];

/**
 * Whether to leave 2 inches of blank canvas around the image so the customer
 * can stretch it themselves later. Same price either way — it is a choice
 * about what they are going to do with it, not an upsell.
 */
export const MARGINS = ["with", "without"];

export type SeedClient = {
  query: (
    text: string,
    values?: unknown[]
  ) => Promise<{
    rows: Record<string, unknown>[];
    rowCount: number | null;
  }>;
};

/** The caller supplies one connected client for the entire transaction. */
export async function syncRolledCanvas(client: SeedClient) {
  await client.query("BEGIN");
  try {
    // Serialize concurrent reruns without needing a new catalogue constraint.
    const found = await client.query(
      "SELECT id FROM products WHERE handle = $1 FOR UPDATE",
      [HANDLE]
    );
    if (!found.rows.length)
      throw new Error(`No product with handle "${HANDLE}"`);
    const id = found.rows[0].id;
    for (const [name, values, affectsPrice, sortOrder] of [
      ["size", SIZES, true, 0],
      ["margin", MARGINS, false, 1],
    ] as const) {
      const existing = await client.query(
        'UPDATE product_options SET "values" = $3::text[], affects_price = $4, sort_order = $5 WHERE product_id = $1 AND name = $2 RETURNING id',
        [id, name, values, affectsPrice, sortOrder]
      );
      if (!existing.rowCount) {
        await client.query(
          'INSERT INTO product_options (product_id, name, "values", affects_price, sort_order) VALUES ($1, $2, $3::text[], $4, $5)',
          [id, name, values, affectsPrice, sortOrder]
        );
      }
    }

    let updated = 0;
    let inserted = 0;
    for (const size of SIZES) {
      for (const margin of MARGINS) {
        const options = JSON.stringify({ size, margin });
        const title = `${size} / ${margin === "with" ? "2in margin" : "no margin"}`;
        const existing = await client.query(
          "UPDATE product_variants SET title = $3, price_cents = $4, currency = 'CAD' WHERE product_id = $1 AND options = $2::jsonb RETURNING id",
          [id, options, title, PRICES[size]]
        );
        if (existing.rowCount) {
          updated += existing.rowCount;
        } else {
          await client.query(
            "INSERT INTO product_variants (product_id, options, title, price_cents, currency, available_for_sale) VALUES ($1, $2::jsonb, $3, $4, 'CAD', true)",
            [id, options, title, PRICES[size]]
          );
          inserted++;
        }
      }
    }
    await client.query("UPDATE products SET updated_at = now() WHERE id = $1", [
      id,
    ]);
    await client.query("COMMIT");
    return { updated, inserted };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function main() {
  console.log(
    `Product: ${HANDLE}; ${SIZES.length} sizes; ${SIZES.length * MARGINS.length} variants`
  );
  for (const size of SIZES) {
    console.log(`  ${size.padEnd(8)} $${(PRICES[size] / 100).toFixed(2)}`);
  }
  if (!process.argv.includes("--apply")) {
    console.log(
      "DRY RUN — no database connection. Pass --apply to update options/prices and insert missing variants."
    );
    return;
  }

  const dotenv = await import("dotenv");
  dotenv.config({ path: ".env.local" });
  const { sql } = await import("@vercel/postgres");
  const client = await sql.connect();
  try {
    const result = await syncRolledCanvas(client);
    console.log(
      `Updated ${result.updated} existing variants; inserted ${result.inserted}. Product copy and activation preserved.`
    );
  } finally {
    client.release();
    await sql.end();
  }
}

if (/(?:^|[/\\])seed-rolled-canvas\.(?:ts|js)$/.test(process.argv[1] ?? "")) {
  main().catch((error) => {
    console.error("FAILED:", error.message);
    process.exitCode = 1;
  });
}
