import type { Product } from "@/types/product";

/**
 * Blank canvas left on every side when the customer takes the stretching
 * margin, in inches. This is what they grip and staple over their own bars.
 */
export const STRETCHING_MARGIN_INCHES = 2;

export type RolledSizeRow = {
  /** The size ordered, and the size of the printed image: "16x20". */
  size: string;
  /** Printed image dimensions in inches. */
  image: { width: number; height: number };
  /** Total sheet including the margin, when taken. */
  total: { width: number; height: number };
  priceCents: number;
};

const area = (size: string) =>
  size.split("x").reduce((product, n) => product * Number(n), 1);

/**
 * The size/price table shown on the page, built from the variants actually on
 * sale rather than a second hand-maintained list.
 *
 * Search engines and customers both need the prices in the page rather than
 * only inside the configurator, and building the table from the same rows the
 * configurator prices from is what keeps the two honest. The margin does not
 * change the price, so one row per size is correct.
 */
export function getRolledSizeRows(product: Product): RolledSizeRow[] {
  const bySize = new Map<string, number>();

  for (const variant of product.variants) {
    const size = variant.options.size;
    if (!size || !variant.availableForSale) continue;
    const existing = bySize.get(size);
    if (existing === undefined || variant.priceCents < existing) {
      bySize.set(size, variant.priceCents);
    }
  }

  return Array.from(bySize.entries())
    .sort(([a], [b]) => area(a) - area(b))
    .map(([size, priceCents]) => {
      const [width, height] = size.split("x").map(Number);
      return {
        size,
        image: { width, height },
        total: {
          width: width + 2 * STRETCHING_MARGIN_INCHES,
          height: height + 2 * STRETCHING_MARGIN_INCHES,
        },
        priceCents,
      };
    });
}

/** "16 × 20 in" — the separator and unit are the same in both locales. */
export const formatInches = (width: number, height: number) =>
  `${width} × ${height} in`;

/** Rounded to the nearest centimetre; canvases are not sold to the millimetre. */
export const formatCentimetres = (width: number, height: number) =>
  `${Math.round(width * 2.54)} × ${Math.round(height * 2.54)} cm`;
