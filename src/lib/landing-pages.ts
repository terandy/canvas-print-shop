/**
 * Single source of truth for the /canvas-prints/[slug] landing pages.
 *
 * The route, the sitemap and the footer navigation all read from here so the
 * three can never drift apart (previously the sitemap listed slugs the route
 * did not serve, and nothing linked to any of them).
 */

/**
 * Cities we actually deliver to. Canvas Print Shop ships within Quebec and
 * Ontario only — Calgary, Vancouver and Edmonton pages were removed because
 * ranking for markets we cannot serve produces traffic that can never convert.
 */
export const CITY_SLUGS = [
  // Quebec
  "montreal",
  "quebec-city",
  "laval",
  "gatineau",
  "sherbrooke",
  "trois-rivieres",
  "longueuil",
  // Ontario
  "toronto",
  "ottawa",
  "mississauga",
  "hamilton",
  "london",
  "kingston",
  "windsor",
] as const;

export const SIZE_SLUGS = ["16x20", "24x36", "36x48"] as const;

export const USE_CASE_SLUGS = [
  "wedding",
  "family",
  "pet-portrait",
  "bedroom",
  "living-room",
  "large",
  "framed",
  "custom",
  "wall-art",
  "gallery-wrap",
  "personalized",
] as const;

export const VALID_SLUGS = [
  ...CITY_SLUGS,
  ...SIZE_SLUGS,
  ...USE_CASE_SLUGS,
] as const;

export type Slug = (typeof VALID_SLUGS)[number];

export const isValidSlug = (slug: string): slug is Slug =>
  (VALID_SLUGS as readonly string[]).includes(slug);

/** Sitemap priority: cities we serve outrank generic size pages. */
export const slugPriority = (slug: Slug): number => {
  if ((CITY_SLUGS as readonly string[]).includes(slug)) return 0.8;
  if ((USE_CASE_SLUGS as readonly string[]).includes(slug)) return 0.7;
  return 0.7;
};

/**
 * Retired slugs — calgary, vancouver, edmonton — are redirected at the edge in
 * `redirects()` in next.config.ts rather than handled here, because
 * `generateMetadata` rejects an unknown slug before the page component runs.
 */
