import { BASE_URL } from "@/lib/constants";
import type { MetadataRoute } from "next";

/**
 * Every page on this site is locale-prefixed (/en/..., /fr/...), so bare
 * `/admin/` style rules never matched a real URL and left the admin, checkout
 * and search routes fully crawlable. Patterns are wildcarded for the locale
 * segment, and those routes now also send `noindex` — robots.txt prevents
 * crawling, not indexing, so both are required.
 *
 * The previous Googlebot-specific block was dropped: a named user-agent group
 * fully replaces the `*` group for that crawler, so Googlebot was silently
 * exempt from the checkout, cart and account rules.
 */
const disallow = [
  "/api/",
  "/_next/",
  "/private/",
  "/admin/",
  "/*/admin/",
  "/checkout/",
  "/*/checkout/",
  "/cart/",
  "/*/cart/",
  "/account/",
  "/*/account/",
  "/*/search",
  "/*?q=",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
