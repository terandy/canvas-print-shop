import { getProductList } from "@/lib/shopify";
import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing"; // Import locales from your i18n configuration

// Define static routes for each locale
const generateStaticRoutes = (): MetadataRoute.Sitemap => {
  let routes: MetadataRoute.Sitemap = [];

  // For the root URL (with locale detection)
  routes.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  });

  // For each locale
  routing.locales.forEach((locale) => {
    // Add locale-specific home page
    routes.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    });

    // Add other static routes here for each locale
    // Example:
    // routes.push({
    //   url: `${BASE_URL}/${locale}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.7,
    // });
  });

  return routes;
};

export const runtime = "edge"; // Optional: Use edge runtime for better performance
export const revalidate = 3600; // Revalidate every hour

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    // Create static routes for each locale
    const staticRoutes = generateStaticRoutes();

    // Fetch products with revalidation
    const products = await getProductList({
      cache: "force-cache",
    }).catch((error) => {
      console.error("Error fetching products for sitemap:", error);
      return [];
    });

    // Generate product routes for each locale
    let productRoutes: MetadataRoute.Sitemap = [];

    routing.locales.forEach((locale) => {
      products.forEach((product) => {
        productRoutes.push({
          url: `${BASE_URL}/${locale}/product/${product.handle}`,
          lastModified: new Date(product.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      });
    });

    // Combine all routes
    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // Fallback to static routes if there's an error
    return generateStaticRoutes();
  }
};

export default sitemap;
