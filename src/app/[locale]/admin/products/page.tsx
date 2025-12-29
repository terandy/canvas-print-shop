import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { Edit, Eye, Package } from "lucide-react";

export default async function AdminProductsPage() {
  const t = await getTranslations("Admin");

  // Get all products with variant count
  const productList = await db
    .select({
      id: products.id,
      handle: products.handle,
      titleEn: products.titleEn,
      titleFr: products.titleFr,
      featuredImageUrl: products.featuredImageUrl,
      isActive: products.isActive,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .orderBy(products.titleEn);

  // Get variant counts
  const variantCounts = await db
    .select({
      productId: productVariants.productId,
      count: count(),
    })
    .from(productVariants)
    .groupBy(productVariants.productId);

  const variantCountMap = new Map(
    variantCounts.map((v) => [v.productId, v.count])
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("products.title")}
        </h1>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productList.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>{t("products.noProducts")}</p>
            <p className="text-sm mt-2">{t("products.willAppear")}</p>
          </div>
        ) : (
          productList.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative">
                {product.featuredImageUrl ? (
                  <Image
                    src={product.featuredImageUrl}
                    alt={product.titleEn}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="h-16 w-16" />
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute top-2 right-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    {t("products.inactive")}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">
                  {product.titleEn}
                </h3>
                {product.titleFr && product.titleFr !== product.titleEn && (
                  <p className="text-sm text-gray-500 truncate">
                    {product.titleFr}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {variantCountMap.get(product.id) || 0} {t("products.variants")}
                  </span>
                  <span>/{product.handle}</span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/product/${product.handle}`}
                    target="_blank"
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t("products.view")}
                  </Link>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t("products.edit")}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
