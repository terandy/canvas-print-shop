import { getProductList } from "@/lib/shopify";
import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

// Define static routes
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  },
  // Add other static routes here
];

export const runtime = "edge"; // Optional: Use edge runtime for better performance
export const revalidate = 3600; // Revalidate every hour

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    // Fetch products with revalidation
    const products = await getProductList({
      cache: "force-cache",
    }).catch((error) => {
      console.error("Error fetching products for sitemap:", error);
      return [];
    });

    // Generate product routes
    const productRoutes = products.map((product) => ({
      url: `${BASE_URL}/product/${product.handle}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Combine all routes
    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // Fallback to static routes if there's an error
    return staticRoutes;
  }
};

export default sitemap;
