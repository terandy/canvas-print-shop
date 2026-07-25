import { getProductList } from "@/lib/db/queries/products";
import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing";
import { VALID_SLUGS, slugPriority } from "@/lib/landing-pages";
import { listPosts } from "@/lib/blog";

/**
 * Landing page URLs are derived from `@/lib/landing-pages` rather than being
 * listed again here. The two lists used to be maintained separately, and the
 * sitemap ended up advertising 42 URLs that the route could not serve.
 */

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified?: Date;
};

const STATIC_PAGES: Entry[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/shop", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faqs", priority: 0.7, changeFrequency: "monthly" },
  {
    path: "/how-we-make-our-canvas-prints",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  { path: "/quality-guarantee", priority: 0.7, changeFrequency: "monthly" },
  { path: "/shipping-policy", priority: 0.6, changeFrequency: "monthly" },
  { path: "/returns-policy", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.5, changeFrequency: "yearly" },
];

/** Builds one sitemap entry per locale, cross-linked with hreflang alternates. */
const localized = (entry: Entry): MetadataRoute.Sitemap =>
  routing.locales.map((locale) => ({
    url: `${BASE_URL}/${locale}${entry.path}`,
    lastModified: entry.lastModified ?? new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((loc) => [
          `${loc}-CA`,
          `${BASE_URL}/${loc}${entry.path}`,
        ])
      ),
    },
  }));

const generateStaticRoutes = (): MetadataRoute.Sitemap => {
  const entries: Entry[] = [
    ...STATIC_PAGES,
    ...VALID_SLUGS.map((slug) => ({
      path: `/canvas-prints/${slug}`,
      priority: slugPriority(slug),
      changeFrequency: "monthly" as const,
    })),
    ...listPosts().map((post) => ({
      path: `/blog/${post.slug}`,
      priority: 0.6,
      changeFrequency: "yearly" as const,
      lastModified: new Date(post.updated ?? post.published),
    })),
  ];

  return entries.flatMap(localized);
};

export const revalidate = 3600; // Revalidate every hour

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const staticRoutes = generateStaticRoutes();

  const products = await getProductList("en").catch((error) => {
    console.error("Error fetching products for sitemap:", error);
    return [];
  });

  const productRoutes = products.flatMap((product) =>
    localized({
      path: `/product/${product.handle}`,
      priority: 0.9,
      changeFrequency: "weekly",
      lastModified: new Date(product.updatedAt),
    })
  );

  return [...staticRoutes, ...productRoutes];
};

export default sitemap;
