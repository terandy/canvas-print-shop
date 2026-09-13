export const CANVAS_SIZES = [
  "8x10",
  "8x12",
  "12x12",
  "10x15",
  "11x14",
  "12x18",
  "16x20",
  "16x24",
  "20x20",
  "24x24",
  "20x30",
  "24x36",
  "30x40",
  "30x45",
  "36x48",
  "40x60",
] as const;

/**
 * Andrew Canvas Pricing: gallery-depth (1.5 inch) canvas supplier costs.
 * Article codes equal width + height, rounded up to the next even number.
 * Values are cents so pricing arithmetic does not depend on decimal strings.
 */
export const GALLERY_SUPPLIER_COSTS_CENTS: Record<number, number> = {
  18: 1895,
  20: 2145,
  22: 2495,
  24: 2645,
  26: 2845,
  28: 2945,
  30: 3045,
  32: 3595,
  34: 3845,
  36: 4095,
  38: 4245,
  40: 4645,
  42: 5145,
  44: 5445,
  46: 5645,
  48: 6395,
  50: 6645,
  52: 7045,
  54: 7495,
  56: 7945,
  58: 8245,
  60: 8495,
  62: 8545,
  64: 9445,
  66: 9895,
  68: 10145,
  70: 10695,
  72: 11495,
  74: 11995,
  76: 12045,
  78: 12745,
  80: 13445,
  82: 14545,
  84: 15145,
  86: 15295,
  88: 15545,
  90: 15975,
  92: 18695,
  94: 19895,
  96: 21195,
  98: 21745,
  100: 22545,
  102: 24845,
  104: 25945,
  106: 27045,
  108: 28245,
  120: 34045,
  132: 38645,
  144: 44395,
};

const PRICE_INCREMENT_CENTS = 500;
const CANVAS_PACKAGING_CENTS = 1500;
const STRETCHED_GROSS_MARGIN = 0.4;
const ROLLED_STARTING_DISCOUNT_FROM_STRETCHED = 0.4;
const ROLLED_APPROVED_UPLIFT = 0.1;

function roundToPriceIncrement(valueCents: number) {
  return Math.round(valueCents / PRICE_INCREMENT_CENTS) * PRICE_INCREMENT_CENTS;
}

function roundUpToPriceIncrement(valueCents: number) {
  return Math.ceil(valueCents / PRICE_INCREMENT_CENTS) * PRICE_INCREMENT_CENTS;
}

export function getCanvasArticleCode(size: string): number | null {
  const match = /^(\d+)x(\d+)$/.exec(size.trim());
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return null;
  return Math.ceil((width + height) / 2) * 2;
}

export function getGallerySupplierCostCents(size: string): number | null {
  const code = getCanvasArticleCode(size);
  if (code === null) return null;
  return GALLERY_SUPPLIER_COSTS_CENTS[code] ?? null;
}

export function getStretchedCanvasPriceCents(size: string): number | null {
  const supplierCost = getGallerySupplierCostCents(size);
  if (supplierCost === null) return null;
  const marginPrice =
    (supplierCost + CANVAS_PACKAGING_CENTS) / (1 - STRETCHED_GROSS_MARGIN);
  return roundToPriceIncrement(marginPrice);
}

/**
 * Customer price policy approved on 13 September 2026:
 * start 40% below the matched stretched retail price, round up to the $5 grid,
 * then apply a 10% uplift and round to the nearest $5. Finally, enforce at
 * least one $5 increase for every larger printed area so no two sizes share a
 * customer price.
 */
function getCalculatedRolledCanvasPriceCents(size: string): number | null {
  const stretchedPrice = getStretchedCanvasPriceCents(size);
  if (stretchedPrice === null) return null;
  const discounted = roundUpToPriceIncrement(
    stretchedPrice * (1 - ROLLED_STARTING_DISCOUNT_FROM_STRETCHED)
  );
  return roundToPriceIncrement(discounted * (1 + ROLLED_APPROVED_UPLIFT));
}

function getCanvasArea(size: string): number | null {
  const match = /^(\d+)x(\d+)$/.exec(size.trim());
  if (!match) return null;
  return Number(match[1]) * Number(match[2]);
}

function buildRolledCanvasPrices(): Record<string, number> {
  let previousArea = 0;
  let previousPrice = 0;

  return Object.fromEntries(
    CANVAS_SIZES.map((size) => {
      const area = getCanvasArea(size);
      const calculatedPrice = getCalculatedRolledCanvasPriceCents(size);
      if (area === null || calculatedPrice === null) {
        throw new Error(`No rolled price for ${size}`);
      }
      if (area <= previousArea) {
        throw new Error(`Canvas sizes are not ordered by area at ${size}`);
      }

      const price = Math.max(
        calculatedPrice,
        previousPrice + PRICE_INCREMENT_CENTS
      );
      previousArea = area;
      previousPrice = price;
      return [size, price];
    })
  );
}

export const STRETCHED_CANVAS_PRICES_CENTS: Record<string, number> =
  Object.fromEntries(
    CANVAS_SIZES.map((size) => {
      const price = getStretchedCanvasPriceCents(size);
      if (price === null) throw new Error(`No stretched price for ${size}`);
      return [size, price];
    })
  );

export const ROLLED_CANVAS_PRICES_CENTS = buildRolledCanvasPrices();

export function getRolledCanvasPriceCents(size: string): number | null {
  return ROLLED_CANVAS_PRICES_CENTS[size] ?? null;
}
