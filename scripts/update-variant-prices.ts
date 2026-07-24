import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { db } from "../src/lib/db/index";
import { productVariants } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

// ============================================
// WHAT WE SELL
// ============================================
// Frames are only fitted to regular-depth canvases, and unframed prints are
// always gallery depth. Depth is not a customer choice — it follows the frame.
// The other two combinations exist as variant rows but are not sold, so this
// script deactivates them rather than pricing them.

const SELLABLE_DEPTH_FOR_FRAME: Record<string, string> = {
  none: "gallery",
  black: "regular",
};

// ============================================
// PRICE MAP
// ============================================
// Unframed (gallery depth): 40% margin → (supplier + $15 packaging) / 0.60,
// rounded to nearest $5.
//
// Framed is deliberately NOT derived from supplier cost on its own. It is the
// unframed price plus an explicit upcharge (below), so the increase a customer
// sees for adding a frame is a number we choose. Previously framed and unframed
// were computed from two separate margin formulas and the upcharge was whatever
// fell out of the subtraction — which made it non-monotonic (40x60 charged less
// to frame than 36x48).
//
// Map: size → unframed gallery price in DOLLARS

const CANVAS_PRICES: Record<string, number> = {
  // Direct matches from supplier pricelist
  "8x10": 55,
  "8x12": 60,
  "11x14": 70,
  "12x18": 75,
  "16x20": 95,
  "16x24": 100,
  "20x30": 135,
  "24x36": 165,
  "30x40": 205,
  "36x48": 275,
  "40x60": 400,

  // Estimated matches (unlabeled supplier codes)
  "12x12": 65, // Code 22
  "10x15": 70, // Code 24
  "20x20": 110, // Code 42
  "24x24": 130, // Code 48
  "30x45": 225, // Code 74
};

// ============================================
// FRAME UPCHARGE
// ============================================
// The supplier prices frames by article code, and the code is the sum of the
// two sides in inches rounded up to the next even number: 8x10 → 18C1,
// 24x36 → 60C1, 40x60 → 100C1. Keying the cost table by that code means any
// size resolves automatically, including ones we don't stock yet.
//
// Costs below are the supplier's, in DOLLARS, before Quebec taxes.

const FRAME_SUPPLIER_COST: Record<number, number> = {
  18: 23.67, // 8x10
  20: 27.45, // 8x12
  22: 29.59,
  24: 31.57, // 12x12
  26: 33.61, // 11x14, 10x15
  28: 33.08, // 12x16
  30: 33.9, // 12x18
  32: 35.02, // 14x18
  34: 36.86,
  36: 39.77, // 16x20
  38: 42.29,
  40: 44.09, // 16x24, 20x20
  42: 46.03,
  44: 47.97, // 20x24
  46: 50.15, // 22x24
  48: 51.7, // 24x24
  50: 52.91, // 20x30
  52: 53.45, // 24x28
  54: 54.71, // 24x30
  56: 56.36,
  58: 58.37,
  60: 59.99, // 24x36
  62: 61.99, // 30x32
  64: 63.63,
  66: 65.62, // 30x36
  68: 67.12,
  70: 69.1, // 30x40
  72: 70.62,
  74: 72.58,
  76: 74.54, // 34x42, 30x45
  78: 75.27,
  80: 77.2,
  82: 79.13,
  84: 80.66, // 36x48
  86: 82.58,
  88: 84.5,
  90: 85.89, // 40x50
  92: 87.8,
  94: 89.71,
  96: 91.18,
  98: 93.08,
  100: 94.72, // 40x60
};

// GST 5% + QST 9.975%. Set to 0 if input tax credits are claimed on frame
// purchases, in which case the tax is recovered and should not be priced in.
const QUEBEC_TAX_RATE = 0.14975;

// The frame line must cover its landed cost at a 20% margin (not markup),
// matching the margin convention used for the canvas prices above.
const FRAME_MARGIN = 0.2;

function getFrameArticleCode(size: string): number | null {
  const [width, height] = size.split("x").map((s) => parseInt(s.trim(), 10));
  if (!width || !height) return null;
  // Codes only exist for even sums, so round up to the next even number.
  return Math.ceil((width + height) / 2) * 2;
}

function getFrameUpcharge(size: string): number | null {
  const code = getFrameArticleCode(size);
  if (code === null) return null;

  const supplierCost = FRAME_SUPPLIER_COST[code];
  if (supplierCost === undefined) return null;

  const landedCost = supplierCost * (1 + QUEBEC_TAX_RATE);
  // Round UP to the nearest $5 so the upcharge always clears the floor.
  return Math.ceil(landedCost / (1 - FRAME_MARGIN) / 5) * 5;
}

function isSellable(frame: string, depth: string): boolean {
  return SELLABLE_DEPTH_FOR_FRAME[frame] === depth;
}

function getNewPrice(
  size: string,
  depth: string,
  frame: string
): number | null {
  const canvasPrice = CANVAS_PRICES[size];
  if (canvasPrice === undefined) return null;
  if (!isSellable(frame, depth)) return null;

  if (frame === "none") return canvasPrice;

  const upcharge = getFrameUpcharge(size);
  return upcharge === null ? null : canvasPrice + upcharge;
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
      availableForSale: productVariants.availableForSale,
      options: productVariants.options,
    })
    .from(productVariants);

  let updated = 0;
  let skipped = 0;
  let unchanged = 0;
  let deactivated = 0;

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

    // Not a combination we sell: retire it, leaving its price alone. Variants
    // are never deleted — order_items references them for historical orders.
    if (!isSellable(frame, depth)) {
      if (variant.availableForSale === false) {
        unchanged++;
        continue;
      }

      console.log(
        `  ${variant.title}: deactivated (${frame} frame + ${depth} depth is not sold)`
      );

      if (!dryRun) {
        await db
          .update(productVariants)
          .set({ availableForSale: false })
          .where(eq(productVariants.id, variant.id));
      }

      deactivated++;
      continue;
    }

    const newPriceDollars = getNewPrice(size, depth, frame);
    if (newPriceDollars === null) {
      console.log(
        `  SKIP: ${variant.title} — no price mapping for size "${size}"`
      );
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
    const upcharge = frame === "none" ? null : getFrameUpcharge(size);
    console.log(
      `  ${variant.title}: $${oldPriceDollars.toFixed(2)} → $${newPriceDollars.toFixed(2)} (${sign}${diff.toFixed(2)})` +
        (upcharge === null ? "" : `  [frame +$${upcharge}]`)
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
  console.log(`Deactivated: ${deactivated}`);
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
