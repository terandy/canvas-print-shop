/**
 * Seeds the Rolled Canvas product.
 *
 *   npx tsx scripts/seed-rolled-canvas.ts          # dry run, prints the plan
 *   npx tsx scripts/seed-rolled-canvas.ts --apply  # writes
 *
 * The product row already existed but was created empty and left inactive: no
 * options, no variants, so it could not have been bought even if switched on.
 * This fills it in and activates it.
 *
 * Idempotent: options and variants are replaced wholesale, so re-running after
 * a price change is safe.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { sql } from "@vercel/postgres";

const HANDLE = "rolled-canvas-prints";
const APPLY = process.argv.includes("--apply");

/**
 * Priced against the regular-depth unframed stretched canvas, tapering from
 * 60% of it at 8x10 down to 50% at 40x60.
 *
 * The saving grows with size because what a rolled print avoids — stretcher
 * bars, hand-stretching, hardware, a box — scales with the canvas, while
 * prepress, the print itself and the tube do not. Half price at 8x10 would not
 * cover the fixed costs.
 */
export const PRICES: Record<string, number> = {
  "8x10": 3000,
  "8x12": 3500,
  "12x12": 3500,
  "10x15": 4000,
  "11x14": 4000,
  "12x18": 4000,
  "16x20": 5000,
  "16x24": 5000,
  "20x20": 5500,
  "24x24": 6000,
  "20x30": 6500,
  "24x36": 8000,
  "30x40": 9500,
  "30x45": 10000,
  "36x48": 12500,
  "40x60": 17500,
};

/** Order the sizes are offered in, smallest first. Matches the stretched product. */
export const SIZES = Object.keys(PRICES);

/**
 * Whether to leave 2 inches of blank canvas around the image so the customer
 * can stretch it themselves later. Same price either way — it is a choice
 * about what they are going to do with it, not an upsell.
 */
export const MARGINS = ["with", "without"];

const EN_DESCRIPTION = `Our canvas, printed to your exact size and shipped flat-rolled in a protective tube. No stretcher frame, no hardware — just the print, ready for you to stretch, mount or frame however you like.

Printed on the same cotton-blend canvas and the same Canon Colorado UVgel press as our stretched canvases, so the image quality is identical. What changes is what arrives: a roll rather than a finished piece, at roughly half the price.

Choose whether to include a 2-inch blank margin around the image. With it, you have canvas to grip and staple when stretching over your own bars — this is what you want if you plan to mount it. Without it, the print stops at the edge of your chosen size, which suits framing behind glass or mounting flat. The price is the same either way.

Every roll is checked in prepress before printing. If your file will not hold up at the size you have chosen, we will tell you before we print it.`;

const FR_DESCRIPTION = `Notre toile, imprimée exactement au format choisi et expédiée à plat dans un tube protecteur. Sans châssis ni quincaillerie — seulement l'impression, prête à être tendue, montée ou encadrée comme vous le souhaitez.

Imprimée sur la même toile de coton mélangé et sur la même presse Canon Colorado UVgel que nos toiles tendues : la qualité d'image est identique. Ce qui change, c'est ce que vous recevez — un rouleau plutôt qu'une pièce finie, à environ la moitié du prix.

Choisissez d'inclure ou non une marge vierge de 2 pouces autour de l'image. Avec la marge, vous avez de quoi saisir et agrafer la toile en la tendant sur vos propres châssis : c'est ce qu'il vous faut si vous comptez la monter. Sans marge, l'impression s'arrête au bord du format choisi, ce qui convient à un encadrement sous verre ou à un montage à plat. Le prix est le même dans les deux cas.

Chaque rouleau est vérifié en prépresse avant l'impression. Si votre fichier ne tient pas la route au format choisi, nous vous le dirons avant d'imprimer.`;

const EN_SEO_TITLE =
  "Rolled Canvas Prints | Printed to Size, Shipped in a Tube";
const FR_SEO_TITLE = "Toile en rouleau | Imprimée au format, expédiée en tube";
const EN_SEO_DESCRIPTION =
  "Custom canvas printed to your size and shipped flat-rolled in a tube — no frame, about half the price of a stretched canvas. Optional 2-inch stretching margin. Printed in Quebec.";
const FR_SEO_DESCRIPTION =
  "Toile personnalisée imprimée à votre format et expédiée à plat en tube — sans châssis, à environ la moitié du prix d'une toile tendue. Marge de 2 pouces optionnelle. Imprimée au Québec.";

async function main() {
  const found =
    await sql`SELECT id, is_active FROM products WHERE handle = ${HANDLE}`;
  if (!found.rowCount) throw new Error(`No product with handle "${HANDLE}"`);
  const { id, is_active } = found.rows[0];

  const variants = SIZES.flatMap((size) =>
    MARGINS.map((margin) => ({
      title: `${size} / ${margin === "with" ? "2in margin" : "no margin"}`,
      priceCents: PRICES[size],
      options: { size, margin },
    }))
  );

  console.log(`product ${HANDLE} (${id}) — currently active=${is_active}`);
  console.log(
    `sizes: ${SIZES.length}, margins: ${MARGINS.length}, variants: ${variants.length}`
  );
  console.log("\nsize      rolled");
  for (const size of SIZES) {
    console.log(`  ${size.padEnd(8)} $${(PRICES[size] / 100).toFixed(2)}`);
  }

  if (!APPLY) {
    console.log("\nDRY RUN — pass --apply to write.");
    return;
  }

  await sql`
    UPDATE products SET
      title_en = 'Rolled Canvas',
      title_fr = 'Toile en rouleau',
      description_en = ${EN_DESCRIPTION},
      description_fr = ${FR_DESCRIPTION},
      description_html_en = ${toHtml(EN_DESCRIPTION)},
      description_html_fr = ${toHtml(FR_DESCRIPTION)},
      seo_title_en = ${EN_SEO_TITLE},
      seo_title_fr = ${FR_SEO_TITLE},
      seo_description_en = ${EN_SEO_DESCRIPTION},
      seo_description_fr = ${FR_SEO_DESCRIPTION},
      is_active = true,
      updated_at = now()
    WHERE id = ${id}`;
  console.log("\nupdated product row (title trimmed, copy set, activated)");

  await sql`DELETE FROM product_options WHERE product_id = ${id}`;
  await sql`
    INSERT INTO product_options (product_id, name, values, affects_price, sort_order)
    VALUES (${id}, 'size', ${SIZES as unknown as string}, true, 0)`;
  await sql`
    INSERT INTO product_options (product_id, name, values, affects_price, sort_order)
    VALUES (${id}, 'margin', ${MARGINS as unknown as string}, false, 1)`;
  console.log("inserted 2 options (size, margin)");

  await sql`DELETE FROM product_variants WHERE product_id = ${id}`;
  for (const v of variants) {
    await sql`
      INSERT INTO product_variants (product_id, title, price_cents, currency, available_for_sale, options)
      VALUES (${id}, ${v.title}, ${v.priceCents}, 'CAD', true, ${JSON.stringify(v.options)})`;
  }
  console.log(`inserted ${variants.length} variants`);
}

/** The stretched product stores paragraphs as <p> blocks; match that. */
function toHtml(text: string) {
  return text
    .split("\n\n")
    .map((p) => `<p>${p.trim()}</p>`)
    .join("\n");
}

if (process.argv[1]?.includes("seed-rolled-canvas")) {
  main().catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
}
