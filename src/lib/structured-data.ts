import {
  BUSINESS_DATA,
  MERCHANT_RETURN_POLICY_ID,
  MONTREAL_LOCATION_ID,
  ORGANIZATION_ID,
  QUEBEC_CITY_LOCATION_ID,
  SITE_URL,
  type SupportedLocale,
} from "@/lib/business-data";
import type { Product } from "@/types/product";

type JsonLd = Record<string, unknown>;

const areaServed = BUSINESS_DATA.deliveryCoverage.regions.map((region) => ({
  "@type": "State",
  name: region.name,
}));

const postalAddress = (
  address: (typeof BUSINESS_DATA.locations)[keyof typeof BUSINESS_DATA.locations]["address"]
) => ({
  "@type": "PostalAddress",
  ...address,
});

export function buildBusinessEntityGraph(): JsonLd {
  const { organization, locations, product } = BUSINESS_DATA;
  const { quebecCityWorkshop, montrealBranch } = locations;

  const organizationEntity: JsonLd = {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: organization.name,
    url: organization.url,
    logo: organization.logo,
    image: organization.image,
    email: organization.email,
    telephone: organization.telephone,
    areaServed,
    knowsLanguage: organization.languages,
    department: [
      { "@id": QUEBEC_CITY_LOCATION_ID },
      { "@id": MONTREAL_LOCATION_ID },
    ],
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      "@id": MERCHANT_RETURN_POLICY_ID,
      applicableCountry: BUSINESS_DATA.deliveryCoverage.country,
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: product.satisfactionReturnDays,
      merchantReturnLink: `${SITE_URL}/en/returns-policy`,
    },
    ...(organization.sameAs.length > 0 ? { sameAs: organization.sameAs } : {}),
  };

  const quebecCityEntity: JsonLd = {
    "@type": "LocalBusiness",
    "@id": QUEBEC_CITY_LOCATION_ID,
    name: quebecCityWorkshop.name,
    parentOrganization: { "@id": ORGANIZATION_ID },
    image: organization.image,
    priceRange: "$$",
    email: quebecCityWorkshop.email,
    telephone: quebecCityWorkshop.telephone,
    address: postalAddress(quebecCityWorkshop.address),
    hasMap: quebecCityWorkshop.mapUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: quebecCityWorkshop.openingHours?.days,
        opens: quebecCityWorkshop.openingHours?.opens,
        closes: quebecCityWorkshop.openingHours?.closes,
      },
    ],
    areaServed,
    subjectOf: [
      { "@type": "WebPage", "@id": `${SITE_URL}/en/canvas-prints/quebec-city` },
      { "@type": "WebPage", "@id": `${SITE_URL}/fr/canvas-prints/quebec-city` },
    ],
  };

  const montrealEntity: JsonLd = {
    "@type": "LocalBusiness",
    "@id": MONTREAL_LOCATION_ID,
    name: montrealBranch.name,
    parentOrganization: { "@id": ORGANIZATION_ID },
    image: organization.image,
    priceRange: "$$",
    address: postalAddress(montrealBranch.address),
    areaServed,
    subjectOf: [
      { "@type": "WebPage", "@id": `${SITE_URL}/en/canvas-prints/montreal` },
      { "@type": "WebPage", "@id": `${SITE_URL}/fr/canvas-prints/montreal` },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organizationEntity, quebecCityEntity, montrealEntity],
  };
}

export function buildMontrealWebPageStructuredData(
  locale: SupportedLocale,
  name: string,
  description: string
): JsonLd {
  const url = `${SITE_URL}/${locale}/canvas-prints/montreal`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    mainEntity: { "@id": MONTREAL_LOCATION_ID },
    about: { "@id": MONTREAL_LOCATION_ID },
  };
}

type ReviewSummary = {
  ratingValue: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
  productStructuredDataEligible: boolean;
};

export function buildProductStructuredData(
  product: Product,
  locale: SupportedLocale,
  reviewSummary: ReviewSummary = BUSINESS_DATA.reviews
): JsonLd {
  const url = `${SITE_URL}/${locale}/product/${product.handle}`;
  const sellableVariants = product.variants.filter(
    (variant) => variant.availableForSale
  );
  const image = [
    product.featuredImage?.url,
    ...product.images.map((item) => item.url),
  ].filter((value, index, values): value is string =>
    Boolean(value && values.indexOf(value) === index)
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image,
    url,
    brand: {
      "@type": "Brand",
      name: BUSINESS_DATA.organization.name,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      offerCount: sellableVariants.length,
      availability:
        sellableVariants.length > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url,
      seller: { "@id": ORGANIZATION_ID },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: [
          {
            "@type": "DefinedRegion",
            addressCountry: BUSINESS_DATA.deliveryCoverage.country,
            addressRegion: BUSINESS_DATA.deliveryCoverage.regions.map(
              (region) => region.code
            ),
          },
        ],
      },
      hasMerchantReturnPolicy: { "@id": MERCHANT_RETURN_POLICY_ID },
    },
    ...(reviewSummary.productStructuredDataEligible
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewSummary.ratingValue,
            reviewCount: reviewSummary.reviewCount,
            bestRating: reviewSummary.bestRating,
            worstRating: reviewSummary.worstRating,
          },
        }
      : {}),
  };
}

/** Escape `<` so user or catalogue text cannot terminate the script element. */
export const serializeJsonLd = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, "\\u003c");
