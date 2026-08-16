import type { Product } from "@/types/product";

export type SupportedLocale = "en" | "fr";

type PostalAddress = {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: "CA";
};

type PhysicalLocation = {
  id: string;
  name: string;
  address: PostalAddress;
  productionLocation: boolean | null;
  localPickup: boolean | null;
  email?: string;
  telephone?: string;
  mapUrl?: string;
  openingHours?: {
    days: readonly string[];
    opens: string;
    closes: string;
  };
};

export type ShopReview = {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://canvasprintshop.ca";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const QUEBEC_CITY_LOCATION_ID = `${SITE_URL}/#quebec-city-location`;
export const MONTREAL_LOCATION_ID = `${SITE_URL}/#montreal-location`;
export const MERCHANT_RETURN_POLICY_ID = `${SITE_URL}/#return-policy`;

/**
 * Existing visible shop-review data.
 *
 * These are general reviews of the print shop, not verified reviews of the
 * canvas product itself. They remain visible on the product page, but are not
 * eligible for Product aggregateRating markup.
 */
export const SHOP_REVIEWS: readonly ShopReview[] = [
  {
    id: 1,
    author: "lesproduitsfleurie",
    rating: 5,
    comment:
      "I highly recommend! Very satisfied with my labels! Great customer service, very fast. Thank you very much.",
    date: "2024-12-15",
    verified: true,
  },
  {
    id: 2,
    author: "Andréanne Blackburn",
    rating: 5,
    comment:
      "I recommend 100% family business, attentive to our needs, with attention to detail",
    date: "2024-12-10",
    verified: true,
  },
  {
    id: 3,
    author: "Mélissa Guérard",
    rating: 5,
    comment:
      "L'équipe est incroyable! Ils savent répondre à nos besoins tant pour le laminage que l'impression",
    date: "2024-12-08",
    verified: true,
  },
  {
    id: 4,
    author: "Carrossier ProColor Lac St-Charles",
    rating: 5,
    comment: "Always quality work! Thank you for your excellent service!",
    date: "2024-12-05",
    verified: true,
  },
  {
    id: 5,
    author: "Guy Tremblay",
    rating: 5,
    comment: "Very satisfied with the work accomplished.",
    date: "2024-12-01",
    verified: true,
  },
  {
    id: 6,
    author: "France Paul",
    rating: 5,
    comment: "Very satisfied with the result and the service!",
    date: "2024-11-28",
    verified: true,
  },
  {
    id: 7,
    author: "Renald Lafleur",
    rating: 5,
    comment: "Best place for imaging in Quebec.",
    date: "2024-11-25",
    verified: true,
  },
  {
    id: 8,
    author: "France Bouchard",
    rating: 5,
    comment: "Always perfect!!!!",
    date: "2024-11-20",
    verified: true,
  },
  {
    id: 9,
    author: "Arka",
    rating: 3,
    comment:
      "Contacted by email for a quote. I assume the project was not within the company's capabilities.",
    date: "2024-11-18",
    verified: false,
  },
  {
    id: 10,
    author: "Andrew G",
    rating: 5,
    comment:
      "Really happy with my canvas. Looks great and came well packed. Took a few days but worth the wait.",
    date: "2025-11-11",
    verified: true,
  },
] as const;

const ratingValue =
  SHOP_REVIEWS.reduce((total, review) => total + review.rating, 0) /
  SHOP_REVIEWS.length;

const quebecCityWorkshop: PhysicalLocation = {
  id: QUEBEC_CITY_LOCATION_ID,
  name: "Canvas Print Shop",
  address: {
    streetAddress: "1172 Av. du Lac-Saint-Charles",
    addressLocality: "Québec",
    addressRegion: "QC",
    postalCode: "G3G 2S7",
    addressCountry: "CA",
  },
  productionLocation: true,
  localPickup: true,
  email: "info@canvasprintshop.ca",
  telephone: "+1-514-441-2230",
  mapUrl: "https://maps.app.goo.gl/fdPr7qQHmF4rRbuD7",
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
  },
};

const montrealBranch: PhysicalLocation = {
  id: MONTREAL_LOCATION_ID,
  name: "Canvas Print Shop Montreal",
  address: {
    streetAddress: "1350 Rue Mazurette",
    addressLocality: "Montreal",
    addressRegion: "Quebec",
    postalCode: "H4N 1H2",
    addressCountry: "CA",
  },
  productionLocation: null,
  localPickup: null,
};

/**
 * Typed source of truth for public business, location, fulfilment and product
 * facts. User-facing prose remains in next-intl; operational facts live here.
 */
export const BUSINESS_DATA = {
  organization: {
    id: ORGANIZATION_ID,
    name: "Canvas Print Shop",
    url: SITE_URL,
    email: quebecCityWorkshop.email!,
    telephone: quebecCityWorkshop.telephone!,
    logo: `${SITE_URL}/favicon.svg`,
    image: `${SITE_URL}/canvas-example.jpeg`,
    sameAs: [] as readonly string[],
    languages: ["en-CA", "fr-CA"] as const,
  },
  locations: {
    quebecCityWorkshop,
    montrealBranch,
  },
  deliveryCoverage: {
    country: "CA" as const,
    regions: [
      { code: "QC", name: "Quebec" },
      { code: "ON", name: "Ontario" },
    ] as const,
  },
  product: {
    madeToOrder: true,
    customerSuppliedArtwork: true,
    materials: {
      canvas: "cotton-blend canvas",
      printing: "Canon Colorado UVgel",
      stretcherFrames: "solid wood",
    },
    handFinishedIn: "Quebec",
    readyToHangHardware: true,
    printQualityGuaranteeYears: 30,
    satisfactionReturnDays: 30,
  },
  standardOnlineOptions: {
    source: "product-catalogue" as const,
    sizeOptionKeys: ["size", "dimension"] as const,
  },
  customOrders: {
    fixedMaximumSize: null,
    quoteRequiredOutsideConfigurator: true,
  },
  productionAndDelivery: {
    productionBusinessDays: { min: 2, max: 4 },
    orderToDeliveryBusinessDays: { min: 5, max: 10 },
    individualOrderSource: "checkout-and-product-estimate" as const,
  },
  reviews: {
    ratingValue,
    reviewCount: SHOP_REVIEWS.length,
    bestRating: 5,
    worstRating: 1,
    source: "visible-general-shop-reviews" as const,
    productStructuredDataEligible: false,
  },
} as const;

/** Read the online size list from the same Product options used by the UI. */
export function getOnlineSizeValues(
  product: Pick<Product, "options">
): readonly string[] {
  const keys = BUSINESS_DATA.standardOnlineOptions.sizeOptionKeys;
  return (
    product.options.find((option) =>
      keys.includes(option.name.toLowerCase() as (typeof keys)[number])
    )?.values ?? []
  );
}

export function getLocationAddressLines(
  location: PhysicalLocation,
  locale: SupportedLocale
): readonly string[] {
  if (location.id === MONTREAL_LOCATION_ID) {
    return locale === "fr"
      ? ["1350, rue Mazurette", "Montréal (Québec) H4N 1H2", "Canada"]
      : ["1350 Rue Mazurette", "Montreal, Quebec H4N 1H2", "Canada"];
  }

  return [
    location.address.streetAddress,
    `${location.address.addressLocality}, ${location.address.addressRegion} ${location.address.postalCode}`,
    "Canada",
  ];
}
