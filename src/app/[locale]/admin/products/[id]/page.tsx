import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { products, productVariants, productOptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({ params }: Props) {
  const t = await getTranslations("Admin");
  const { id } = await params;

  // Get product with variants and options
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id));

  if (!product) {
    notFound();
  }

  const [variants, options] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id)),
    db
      .select()
      .from(productOptions)
      .where(eq(productOptions.productId, id))
      .orderBy(productOptions.sortOrder),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("products.backToProducts")}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{product.titleEn}</h1>
        <p className="text-gray-500">/{product.handle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("products.basicInfo")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("products.titleEn")}
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">
                  {product.titleEn}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("products.titleFr")}
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">
                  {product.titleFr || "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("products.handle")}
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md font-mono text-sm">
                  {product.handle}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("products.status")}
                </label>
                <p
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    product.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.isActive
                    ? t("products.active")
                    : t("products.inactive")}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("products.options")} ({options.length})
            </h2>
            {options.length === 0 ? (
              <p className="text-gray-500">{t("products.noOptions")}</p>
            ) : (
              <div className="space-y-4">
                {options.map((option) => (
                  <div key={option.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {option.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          option.affectsPrice
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {option.affectsPrice
                          ? t("products.affectsPrice")
                          : t("products.displayOnly")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(option.values || []).map((value, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("products.variants")} ({variants.length})
            </h2>
            {variants.length === 0 ? (
              <p className="text-gray-500">{t("products.noOptions")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">
                        {t("products.sku")}
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">
                        Title
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">
                        {t("products.options")}
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">
                        Price
                      </th>
                      <th className="px-4 py-2 text-center font-medium text-gray-500">
                        {t("products.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {variants.map((variant) => (
                      <tr key={variant.id}>
                        <td className="px-4 py-2 font-mono text-xs">
                          {variant.sku || "-"}
                        </td>
                        <td className="px-4 py-2">{variant.title}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.options).map(
                              ([key, value]) => (
                                <span
                                  key={key}
                                  className="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
                                >
                                  {key}: {value}
                                </span>
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          ${(variant.priceCents / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span
                            className={`inline-flex h-2 w-2 rounded-full ${
                              variant.availableForSale
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("products.featuredImage")}
            </h2>
            {product.featuredImageUrl ? (
              <Image
                src={product.featuredImageUrl}
                alt={product.titleEn}
                width={400}
                height={400}
                className="w-full rounded-lg"
              />
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                {t("products.noImage")}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("products.metadata")}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("products.created")}</span>
                <span>
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("products.updated")}</span>
                <span>
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("products.id")}</span>
                <span className="font-mono text-xs truncate max-w-[120px]">
                  {product.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
