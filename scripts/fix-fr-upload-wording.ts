/**
 * Replaces "télécharger" (download) with "téléverser" (upload) in the French
 * product copy held in the database.
 *
 * The French site tells customers to *download* their photo at the exact point
 * it is asking them to upload one. The nine instances in `messages/fr.json` are
 * fixed in that file; this covers the copy that lives in Postgres instead and
 * therefore renders on `/fr/produit/canvas`, the primary commercial page.
 *
 * Dry run:  tsx scripts/fix-fr-upload-wording.ts
 * Apply:    tsx scripts/fix-fr-upload-wording.ts --apply
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { db } from "../src/lib/db/index";
import { products } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

/** Only the French columns — the English copy legitimately says "download". */
const FRENCH_COLUMNS = [
  "descriptionFr",
  "descriptionHtmlFr",
  "seoDescriptionFr",
  "titleFr",
  "seoTitleFr",
] as const;

const REWRITES: [RegExp, string][] = [
  [/Téléchargez/g, "Téléversez"],
  [/téléchargez/g, "téléversez"],
  [/Télécharger/g, "Téléverser"],
  [/télécharger/g, "téléverser"],
  [/Téléchargement/g, "Téléversement"],
  [/téléchargement/g, "téléversement"],
  [/téléchargées/g, "téléversées"],
  [/téléchargée/g, "téléversée"],
  [/téléchargés/g, "téléversés"],
  [/téléchargé/g, "téléversé"],
];

const rewrite = (value: string) =>
  REWRITES.reduce((acc, [re, to]) => acc.replace(re, to), value);

const apply = process.argv.includes("--apply");

const main = async () => {
  const rows = (await db.select().from(products)) as unknown as Record<
    string,
    unknown
  >[];

  let touched = 0;

  for (const row of rows) {
    const updates: Record<string, string> = {};

    for (const column of FRENCH_COLUMNS) {
      const value = row[column];
      if (typeof value !== "string" || !/télécharg/i.test(value)) continue;

      const next = rewrite(value);
      if (next === value) continue;
      updates[column] = next;

      console.log(`\n${row.handle} — ${column}`);
      for (const m of value.matchAll(/.{0,60}télécharg.{0,60}/gi)) {
        console.log(`  -  …${m[0]}…`);
      }
      for (const m of next.matchAll(/.{0,60}télévers.{0,60}/gi)) {
        console.log(`  +  …${m[0]}…`);
      }
    }

    if (Object.keys(updates).length === 0) continue;
    touched++;

    if (apply) {
      await db
        .update(products)
        .set(updates)
        .where(eq(products.handle, row.handle as string));
    }
  }

  if (touched === 0) {
    console.log("Nothing to change — no French column contains 'télécharg'.");
  } else if (apply) {
    console.log(`\nApplied to ${touched} product row(s).`);
  } else {
    console.log(
      `\nDry run — ${touched} product row(s) would change. Re-run with --apply.`
    );
  }
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
