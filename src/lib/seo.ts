import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing";

/**
 * Builds the `alternates` block for a page: a self-referencing canonical plus
 * per-locale hreflang pointing at *this* path (not the locale root).
 *
 * Previously the root layout declared a single site-wide canonical, which every
 * child route inherited — telling Google that every page was a duplicate of the
 * homepage. Canonicals must be set per page instead.
 *
 * @param locale current locale, e.g. "en"
 * @param path   locale-relative path with a leading slash, or "" for home
 */
export const canonicalMetadata = (
  locale: string,
  path: string = ""
): Pick<Metadata, "alternates"> => {
  const languages: Record<string, string> = {};

  for (const loc of routing.locales) {
    // Google expects region-qualified codes for a Canada-only bilingual store.
    languages[`${loc}-CA`] = `${BASE_URL}/${loc}${path}`;
  }
  languages["x-default"] = `${BASE_URL}/${routing.defaultLocale}${path}`;

  return {
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages,
    },
  };
};

/**
 * OpenGraph fields that depend on locale/path. Spread alongside page-specific
 * title/description/images.
 */
export const openGraphMetadata = (locale: string, path: string = "") => ({
  url: `${BASE_URL}/${locale}${path}`,
  siteName: "Canvas Print Shop",
  locale: locale === "fr" ? "fr_CA" : "en_CA",
  type: "website" as const,
});

/** Applied to routes that must never enter the index (admin, checkout, search). */
export const noIndexMetadata: Pick<Metadata, "robots"> = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};
