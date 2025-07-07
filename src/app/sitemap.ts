import { getProductList } from "@/lib/shopify";
import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing";

// Generate static routes for each locale
const generateStaticRoutes = (): MetadataRoute.Sitemap => {
  let routes: MetadataRoute.Sitemap = [];

  // Root URL (redirects to default locale)
  routes.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
    alternates: {
      languages: {
        en: `${BASE_URL}/en`,
        fr: `${BASE_URL}/fr`,
      },
    },
  });

  // Static pages for each locale
  const staticPages = [
    { path: "", priority: 1 }, // Home page
    { path: "/contact", priority: 0.8 },
    { path: "/faqs", priority: 0.7 },
    { path: "/shipping-policy", priority: 0.6 },
    { path: "/returns-policy", priority: 0.6 },
    { path: "/privacy-policy", priority: 0.5 },
    { path: "/how-we-make-our-canvas-prints", priority: 0.7 },
    { path: "/quality-guarantee", priority: 0.7 },
  ];

  routing.locales.forEach((locale) => {
    staticPages.forEach(({ path, priority }) => {
      const url = `${BASE_URL}/${locale}${path}`;
      routes.push({
        url,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority,
        alternates: {
          languages: {
            en: `${BASE_URL}/en${path}`,
            fr: `${BASE_URL}/fr${path}`,
          },
        },
      });
    });
  });

  return routes;
};

export const revalidate = 3600; // Revalidate every hour

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    // Generate static routes
    const staticRoutes = generateStaticRoutes();

    // Fetch products (this will use the default locale for product fetching)
    const products = await getProductList({
      cache: "force-cache",
    }).catch((error) => {
      console.error("Error fetching products for sitemap:", error);
      return [];
    });

    // Generate product routes for each locale
    let productRoutes: MetadataRoute.Sitemap = [];

    products.forEach((product) => {
      routing.locales.forEach((locale) => {
        productRoutes.push({
          url: `${BASE_URL}/${locale}/product/${product.handle}`,
          lastModified: new Date(product.updatedAt),
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/product/${product.handle}`,
              fr: `${BASE_URL}/fr/product/${product.handle}`,
            },
          },
        });
      });
    });

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return generateStaticRoutes();
  }
};

export default sitemap;
