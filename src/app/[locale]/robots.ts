import { BASE_URL } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/private/",
          "/api/",
          "/_next/",
          "/admin/",
          "/checkout/",
          "/cart/",
          "/account/",
        ],
      },
      // Optimize for search engine bots
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/private/", "/api/", "/admin/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
