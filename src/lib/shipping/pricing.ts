import type { Cart } from "@/types/cart";

export const SHIPPING_PRICING_VERSION = "province-size-v1-2026-09-14";

export const DELIVERY_PROVINCE_CODES = [
  "QC",
  "ON",
  "NB",
  "NS",
  "PE",
  "NL",
  "MB",
  "SK",
  "AB",
  "BC",
] as const;

export const TERRITORY_CODES = ["YT", "NT", "NU"] as const;

export type DeliveryProvince = (typeof DELIVERY_PROVINCE_CODES)[number];
export type TerritoryCode = (typeof TERRITORY_CODES)[number];
export type CanadianRegionCode = DeliveryProvince | TerritoryCode;
export type ShippingBand = "small" | "medium" | "large" | "xl" | "xxl";

/**
 * Customer-facing rates in Canadian cents, before tax.
 *
 * Apply the same size rates to stretched, framed and rolled canvases. For a
 * multi-item order charge the largest shipping band once, regardless of
 * quantity. Approved by the shop owner on 15 September 2026.
 */
export const SHIPPING_RATES_CENTS: Readonly<
  Record<DeliveryProvince, Readonly<Record<ShippingBand, number>>>
> = {
  QC: { small: 3000, medium: 3500, large: 4500, xl: 6000, xxl: 9500 },
  ON: { small: 3000, medium: 4000, large: 5500, xl: 7500, xxl: 13500 },
  NB: { small: 3000, medium: 4500, large: 6500, xl: 9000, xxl: 16500 },
  NS: { small: 3000, medium: 4500, large: 6500, xl: 9000, xxl: 16500 },
  PE: { small: 3000, medium: 4500, large: 6500, xl: 9000, xxl: 16500 },
  NL: { small: 3500, medium: 5000, large: 7500, xl: 10000, xxl: 18000 },
  MB: { small: 3000, medium: 4500, large: 7000, xl: 9500, xxl: 17500 },
  SK: { small: 3500, medium: 5000, large: 7500, xl: 10000, xxl: 18000 },
  AB: { small: 3500, medium: 5500, large: 8500, xl: 11000, xxl: 20000 },
  BC: { small: 4000, medium: 6000, large: 9000, xl: 11500, xxl: 21000 },
};

const REGION_ALIASES: Readonly<Record<string, CanadianRegionCode>> = {
  AB: "AB",
  ALBERTA: "AB",
  BC: "BC",
  "BRITISH COLUMBIA": "BC",
  "COLOMBIE BRITANNIQUE": "BC",
  MB: "MB",
  MANITOBA: "MB",
  NB: "NB",
  "NEW BRUNSWICK": "NB",
  "NOUVEAU BRUNSWICK": "NB",
  NL: "NL",
  "NEWFOUNDLAND AND LABRADOR": "NL",
  "TERRE NEUVE ET LABRADOR": "NL",
  NS: "NS",
  "NOVA SCOTIA": "NS",
  "NOUVELLE ECOSSE": "NS",
  ON: "ON",
  ONTARIO: "ON",
  PE: "PE",
  PEI: "PE",
  "PRINCE EDWARD ISLAND": "PE",
  "ILE DU PRINCE EDOUARD": "PE",
  QC: "QC",
  PQ: "QC",
  QUEBEC: "QC",
  SK: "SK",
  SASKATCHEWAN: "SK",
  YT: "YT",
  YUKON: "YT",
  NT: "NT",
  NWT: "NT",
  "NORTHWEST TERRITORIES": "NT",
  "TERRITOIRES DU NORD OUEST": "NT",
  NU: "NU",
  NUNAVUT: "NU",
};

const POSTAL_FIRST_LETTER_REGIONS: Readonly<
  Record<string, readonly CanadianRegionCode[]>
> = {
  A: ["NL"],
  B: ["NS"],
  C: ["PE"],
  E: ["NB"],
  G: ["QC"],
  H: ["QC"],
  J: ["QC"],
  K: ["ON"],
  L: ["ON"],
  M: ["ON"],
  N: ["ON"],
  P: ["ON"],
  R: ["MB"],
  S: ["SK"],
  T: ["AB"],
  V: ["BC"],
  X: ["NT", "NU"],
  Y: ["YT"],
};

export type AutomaticDeliveryProfile = {
  band: ShippingBand;
  dimensions: { width: number; height: number };
};

export type AutomaticDeliveryAssessment =
  | { eligible: true; profile: AutomaticDeliveryProfile }
  | {
      eligible: false;
      reason:
        | "empty-cart"
        | "invalid-quantity"
        | "unsupported-product"
        | "invalid-size"
        | "unsupported-size";
    };

function simplifyRegionName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCanadianRegion(
  value: string | null | undefined
): CanadianRegionCode | null {
  if (!value) return null;
  return REGION_ALIASES[simplifyRegionName(value)] ?? null;
}

export function isDeliveryProvince(
  value: CanadianRegionCode
): value is DeliveryProvince {
  return (DELIVERY_PROVINCE_CODES as readonly string[]).includes(value);
}

export function normalizeCanadianPostalCode(
  value: string | null | undefined
): string | null {
  if (!value) return null;

  const compact = value.toUpperCase().replace(/[\s-]+/g, "");
  if (
    !/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]\d[ABCEGHJKLMNPRSTVWXYZ]\d$/.test(
      compact
    )
  ) {
    return null;
  }

  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

export function postalCodeMatchesRegion(
  postalCode: string,
  region: CanadianRegionCode
): boolean {
  const normalized = normalizeCanadianPostalCode(postalCode);
  if (!normalized) return false;
  return (POSTAL_FIRST_LETTER_REGIONS[normalized[0]] ?? []).includes(region);
}

export function parseCanvasDimensions(
  value: string | null | undefined
): { width: number; height: number } | null {
  if (!value) return null;
  const match = value.match(
    /^\s*(\d{1,3})\s*(?:x|×)\s*(\d{1,3})\s*(?:"|″|in(?:ches)?)?\s*$/i
  );
  if (!match) return null;

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1
  ) {
    return null;
  }
  return { width, height };
}

export function getShippingBand(dimensions: {
  width: number;
  height: number;
}): ShippingBand | null {
  const shortSide = Math.min(dimensions.width, dimensions.height);
  const longSide = Math.max(dimensions.width, dimensions.height);

  // 40x60 is the sole current online format beyond 48 inches. Do not apply
  // its extrapolated rate to arbitrary custom dimensions.
  if (shortSide === 40 && longSide === 60) return "xxl";
  if (longSide <= 12) return "small";
  if (longSide <= 24) return "medium";
  if (longSide <= 36) return "large";
  if (longSide <= 48) return "xl";
  return null;
}

export function parseShippingBand(
  value: string | null | undefined
): ShippingBand | null {
  return value && ["small", "medium", "large", "xl", "xxl"].includes(value)
    ? (value as ShippingBand)
    : null;
}

export function assessAutomaticDelivery(
  cart: Pick<Cart, "items" | "totalQuantity"> | null | undefined
): AutomaticDeliveryAssessment {
  if (!cart || cart.items.length === 0 || cart.totalQuantity === 0) {
    return { eligible: false, reason: "empty-cart" };
  }
  const bands: ShippingBand[] = ["small", "medium", "large", "xl", "xxl"];
  let largest: AutomaticDeliveryProfile | undefined;
  let quantity = 0;
  for (const item of cart.items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      return { eligible: false, reason: "invalid-quantity" };
    }
    quantity += item.quantity;
    if (!["canvas", "rolled-canvas-prints"].includes(item.productHandle)) {
      return { eligible: false, reason: "unsupported-product" };
    }
    const dimensions = parseCanvasDimensions(
      item.selectedOptions.dimension || item.selectedOptions.size
    );
    if (!dimensions) return { eligible: false, reason: "invalid-size" };
    const band = getShippingBand(dimensions);
    if (!band) return { eligible: false, reason: "unsupported-size" };
    if (!largest || bands.indexOf(band) > bands.indexOf(largest.band)) {
      largest = { band, dimensions };
    }
  }
  if (quantity !== cart.totalQuantity || !Number.isSafeInteger(quantity)) {
    return { eligible: false, reason: "invalid-quantity" };
  }
  return largest
    ? { eligible: true, profile: largest }
    : { eligible: false, reason: "empty-cart" };
}

export function getShippingRateCents(
  province: DeliveryProvince,
  band: ShippingBand
): number {
  return SHIPPING_RATES_CENTS[province][band];
}

export type DeliveryQuoteEvidence = {
  province: DeliveryProvince;
  band: ShippingBand;
  pricingVersion: string;
};

type StandardCheckoutShippingEvidence = {
  sessionMetadata: Record<string, string> | null | undefined;
  shippingAddress:
    | {
        state: string;
        postalCode: string;
        country: string;
      }
    | undefined;
  shippingCents: number;
  resolvedShippingCents: number | null;
  fulfilmentMethod: "delivery" | "pickup";
  deliveryQuote: DeliveryQuoteEvidence | null;
};

/**
 * Last-line server validation used by the Stripe webhook before any order is
 * written. Sessions created before this pricing version remain compatible;
 * all sessions created by the new embedded checkout are strictly checked.
 */
export function assertValidStandardCheckoutShipping({
  sessionMetadata,
  shippingAddress,
  shippingCents,
  resolvedShippingCents,
  fulfilmentMethod,
  deliveryQuote,
}: StandardCheckoutShippingEvidence): void {
  if (sessionMetadata?.shippingPricingVersion !== SHIPPING_PRICING_VERSION) {
    return;
  }

  if (fulfilmentMethod === "pickup") {
    if (
      shippingCents !== 0 ||
      (resolvedShippingCents !== null && resolvedShippingCents !== 0)
    ) {
      throw new Error("Pickup shipping amount is invalid");
    }
    return;
  }

  const sessionBand = parseShippingBand(sessionMetadata.shippingBand);
  if (sessionMetadata.automaticDelivery !== "true" || !sessionBand) {
    throw new Error("Automatic delivery is not enabled for this checkout");
  }
  if (!deliveryQuote) {
    throw new Error("Delivery quote metadata is missing");
  }
  if (
    deliveryQuote.pricingVersion !== SHIPPING_PRICING_VERSION ||
    deliveryQuote.band !== sessionBand
  ) {
    throw new Error("Delivery quote metadata does not match the checkout");
  }
  if (!shippingAddress || shippingAddress.country.toUpperCase() !== "CA") {
    throw new Error("Canadian delivery address is required");
  }

  const addressProvince = normalizeCanadianRegion(shippingAddress.state);
  const postalCode = normalizeCanadianPostalCode(shippingAddress.postalCode);
  if (
    !addressProvince ||
    !isDeliveryProvince(addressProvince) ||
    !postalCode ||
    !postalCodeMatchesRegion(postalCode, addressProvince) ||
    addressProvince !== deliveryQuote.province
  ) {
    throw new Error("Delivery province and postal code do not match");
  }

  const expectedCents = getShippingRateCents(addressProvince, sessionBand);
  if (
    shippingCents !== expectedCents ||
    (resolvedShippingCents !== null && resolvedShippingCents !== expectedCents)
  ) {
    throw new Error("Delivery shipping amount is invalid");
  }
}
