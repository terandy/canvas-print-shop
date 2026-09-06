/**
 * Which rich page layout a product gets, and which copy fills it.
 *
 * The product page used to gate its whole marketing layout on
 * `handle === "canvas"`, so every other product fell through to a much plainer
 * page. That was fine when there was only one product; it meant the rolled
 * canvas shipped looking like an afterthought.
 *
 * Each entry names a translation namespace under `Product` and the keys that
 * fill each repeated section. The section shapes are identical, so both
 * products render through the same components — only the copy differs, and
 * only where the products genuinely differ. A handle with no entry here still
 * gets the plain layout, which is the right default for anything new.
 */
export type ProductPageContent = {
  /** Namespace under the `Product` translation namespace. */
  namespace: string;
  featureCards: readonly { key: string; icon: string }[];
  comparisonRows: readonly string[];
  keyDetails: readonly string[];
  /** Keys under `Product.faq.questions`. */
  faqQuestions: readonly string[];
};

const canvas: ProductPageContent = {
  namespace: "canvasPage",
  featureCards: [
    { key: "premiumCanvas", icon: "01" },
    { key: "archivalPrinting", icon: "02" },
    { key: "handStretched", icon: "03" },
    { key: "readyToHang", icon: "04" },
  ],
  comparisonRows: [
    "material",
    "opacity",
    "technology",
    "frames",
    "origin",
    "guarantee",
  ],
  keyDetails: [
    "productionTime",
    "delivery",
    "builtToLast",
    "satisfaction",
    "localPickup",
    "shippingCost",
  ],
  faqQuestions: [
    "imageQuality",
    "depthDifference",
    "localPickupAvailable",
    "satisfaction",
    "durability",
    "deliveryTime",
    "multipleCanvases",
  ],
};

/**
 * The rolled print shares the canvas, the press and the workshop, so those
 * claims carry over. What it does not share is stretching, hardware and
 * hanging — those slots are replaced rather than reworded, because a rolled
 * print genuinely is a different object.
 */
const canvasRolls: ProductPageContent = {
  namespace: "rollsPage",
  featureCards: [
    { key: "premiumCanvas", icon: "01" },
    { key: "archivalPrinting", icon: "02" },
    { key: "printedToSize", icon: "03" },
    { key: "shippedFlat", icon: "04" },
  ],
  comparisonRows: [
    "material",
    "opacity",
    "technology",
    "margin",
    "origin",
    "guarantee",
  ],
  keyDetails: [
    "productionTime",
    "delivery",
    "assembly",
    "satisfaction",
    "localPickup",
    "shippingCost",
  ],
  faqQuestions: [
    "rollWhatArrives",
    "rollMargin",
    "rollStretching",
    "imageQuality",
    "localPickupAvailable",
    "satisfaction",
    "deliveryTime",
  ],
};

const BY_HANDLE: Record<string, ProductPageContent> = {
  canvas,
  "canvas-rolls": canvasRolls,
};

export const getProductPageContent = (
  handle: string
): ProductPageContent | null => BY_HANDLE[handle] ?? null;
