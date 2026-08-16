import { BUSINESS_DATA, SITE_URL } from "@/lib/business-data";

export const SHOPIFY_GRAPHQL_API_ENDPOINT = "/api/2025-01/graphql.json";

export const TAGS = {
  products: "products",
  cart: "cart",
};

export const DEFAULT_OPTION = "Default Title";

export const BASE_URL = SITE_URL;
export const EMAIL = {
  label: BUSINESS_DATA.organization.email,
  href: `mailto:${BUSINESS_DATA.organization.email}`,
};
export const PHONE = {
  label: "(514) 441-2230",
  href: `tel:${BUSINESS_DATA.organization.telephone.replace(/[^+\d]/g, "")}`,
};
export const ADDRESS = {
  label: `${BUSINESS_DATA.locations.quebecCityWorkshop.address.streetAddress}:: Québec, QC, G3G 2S7 :: Canada`,
  href: BUSINESS_DATA.locations.quebecCityWorkshop.mapUrl!,
};

export const DEFAULT_CANVAS_IMAGE = "";
