/**
 * Applies a generated drizzle migration to the database in .env.local.
 *
 *   npx tsx scripts/apply-migration.ts drizzle/0001_many_centennial.sql
 *
 * This project's schema was not created through drizzle's migrator, so there is
 * no `__drizzle_migrations` journal and `drizzle-kit migrate` would try to
 * replay 0000 and fail against the existing tables. Until the journal is
 * baselined, migrations are applied statement by statement from here.
 *
 * Each statement is checked before it runs and skipped when already applied, so
 * re-running after a partial failure is safe. Add-column migrations are
 * metadata-only in Postgres and do not rewrite the table.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { sql } from "@vercel/postgres";

const file = process.argv[2];
if (!file) {
  console.error("Usage: tsx scripts/apply-migration.ts <path-to-migration.sql>");
  process.exit(1);
}

/** "ALTER TABLE x ADD COLUMN y ..." → the table and column it would create. */
function addedColumn(statement: string) {
  const match = statement.match(
    /ALTER TABLE\s+"?(\w+)"?\s+ADD COLUMN\s+"?(\w+)"?/i
  );
  return match ? { table: match[1], column: match[2] } : null;
}

async function main() {
  const statements = readFileSync(file, "utf8")
    .split("--> statement-breakpoint")
    .map((s) => s.trim().replace(/;$/, ""))
    .filter(Boolean);

  const meta = await sql`SELECT current_database() AS db`;
  console.log(`database: ${meta.rows[0].db}`);
  console.log(`${file}: ${statements.length} statement(s)\n`);

  let applied = 0;
  let skipped = 0;

  for (const statement of statements) {
    const target = addedColumn(statement);

    if (target) {
      const existing = await sql`
        SELECT 1 FROM information_schema.columns
        WHERE table_name = ${target.table} AND column_name = ${target.column}`;
      if (existing.rowCount) {
        console.log(`skip  ${target.table}.${target.column} (already exists)`);
        skipped++;
        continue;
      }
    }

    await sql.query(statement);
    console.log(
      `apply ${target ? `${target.table}.${target.column}` : statement.slice(0, 60)}`
    );
    applied++;
  }

  console.log(`\napplied ${applied}, skipped ${skipped}`);
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
