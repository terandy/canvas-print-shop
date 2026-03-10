import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { db } from "../src/lib/db/index";
import { productVariants } from "../src/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// ============================================
// PRICE MAP
// ============================================
// Canvas-only: 40% margin → (supplier + $15 packaging) / 0.60, rounded to nearest $5
// Framed:      30% margin → (canvas_supplier + frame_supplier + $15 packaging) / 0.70, rounded to nearest $5
//
// Map: size → { canvas_regular, canvas_gallery, frame_regular, frame_gallery } in DOLLARS

const PRICE_MAP: Record<
  string,
  { canvas_regular: number; canvas_gallery: number; frame_regular: number; frame_gallery: number }
> = {
  // Direct matches from supplier pricelist
  "8x10": { canvas_regular: 50, canvas_gallery: 55, frame_regular: 80, frame_gallery: 85 },
  "8x12": { canvas_regular: 55, canvas_gallery: 60, frame_regular: 85, frame_gallery: 90 },
  "11x14": { canvas_regular: 65, canvas_gallery: 70, frame_regular: 100, frame_gallery: 110 },
  "12x18": { canvas_regular: 70, canvas_gallery: 75, frame_regular: 110, frame_gallery: 120 },
  "16x20": { canvas_regular: 85, canvas_gallery: 95, frame_regular: 130, frame_gallery: 145 },
  "16x24": { canvas_regular: 90, canvas_gallery: 100, frame_regular: 145, frame_gallery: 160 },
  "20x30": { canvas_regular: 120, canvas_gallery: 135, frame_regular: 180, frame_gallery: 200 },
  "24x36": { canvas_regular: 150, canvas_gallery: 165, frame_regular: 215, frame_gallery: 240 },
  "30x40": { canvas_regular: 180, canvas_gallery: 205, frame_regular: 255, frame_gallery: 285 },
  "36x48": { canvas_regular: 245, canvas_gallery: 275, frame_regular: 330, frame_gallery: 370 },
  "40x60": { canvas_regular: 350, canvas_gallery: 400, frame_regular: 445, frame_gallery: 500 },

  // Estimated matches (unlabeled supplier codes)
  "12x12": { canvas_regular: 60, canvas_gallery: 65, frame_regular: 90, frame_gallery: 100 }, // Code 22
  "10x15": { canvas_regular: 65, canvas_gallery: 70, frame_regular: 95, frame_gallery: 105 }, // Code 24
  "20x20": { canvas_regular: 100, canvas_gallery: 110, frame_regular: 155, frame_gallery: 170 }, // Code 42
  "24x24": { canvas_regular: 115, canvas_gallery: 130, frame_regular: 175, frame_gallery: 195 }, // Code 48
  "30x45": { canvas_regular: 200, canvas_gallery: 225, frame_regular: 280, frame_gallery: 310 }, // Code 74
};

function getNewPrice(size: string, depth: string, frame: string): number | null {
  const entry = PRICE_MAP[size];
  if (!entry) return null;

  if (frame === "none" && depth === "regular") return entry.canvas_regular;
  if (frame === "none" && depth === "gallery") return entry.canvas_gallery;
  if (frame === "black" && depth === "regular") return entry.frame_regular;
  if (frame === "black" && depth === "gallery") return entry.frame_gallery;

  return null;
}

async function updatePrices() {
  const dryRun = process.argv.includes("--dry-run");

  if (dryRun) {
    console.log("=== DRY RUN (no changes will be made) ===\n");
  } else {
    console.log("=== UPDATING PRICES ===\n");
  }

  const variants = await db
    .select({
      id: productVariants.id,
      title: productVariants.title,
      priceCents: productVariants.priceCents,
      options: productVariants.options,
    })
    .from(productVariants);

  let updated = 0;
  let skipped = 0;
  let unchanged = 0;

  for (const variant of variants) {
    const { size, depth, frame } = variant.options as {
      size: string;
      depth: string;
      frame: string;
    };

    if (!size || !depth || !frame) {
      console.log(`  SKIP: ${variant.title} — missing options`);
      skipped++;
      continue;
    }

    const newPriceDollars = getNewPrice(size, depth, frame);
    if (newPriceDollars === null) {
      console.log(`  SKIP: ${variant.title} — no price mapping for size "${size}"`);
      skipped++;
      continue;
    }

    const newPriceCents = newPriceDollars * 100;
    const oldPriceDollars = variant.priceCents / 100;

    if (variant.priceCents === newPriceCents) {
      unchanged++;
      continue;
    }

    const diff = newPriceDollars - oldPriceDollars;
    const sign = diff > 0 ? "+" : "";
    console.log(
      `  ${variant.title}: $${oldPriceDollars.toFixed(2)} → $${newPriceDollars.toFixed(2)} (${sign}${diff.toFixed(2)})`
    );

    if (!dryRun) {
      await db
        .update(productVariants)
        .set({ priceCents: newPriceCents })
        .where(eq(productVariants.id, variant.id));
    }

    updated++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Skipped: ${skipped}`);

  if (dryRun) {
    console.log("\nRe-run without --dry-run to apply changes.");
  }
}

updatePrices()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
