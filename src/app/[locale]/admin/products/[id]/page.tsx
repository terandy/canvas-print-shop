import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { products, productVariants, productOptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/product-form";
import VariantList from "@/components/admin/variant-list";
import OptionList from "@/components/admin/option-list";

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("products.edit")}: {product.titleEn}
            </h1>
            <p className="text-gray-500">/{product.handle}</p>
          </div>
          <Link
            href={`/product/${product.handle}`}
            target="_blank"
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            {t("products.viewOnStore")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("products.basicInfo")}
            </h2>
            <ProductForm product={product} />
          </div>

          {/* Options */}
          <OptionList productId={id} options={options} />

          {/* Variants */}
          <VariantList
            productId={id}
            variants={variants}
            productOptions={options}
          />
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
                <span className="text-gray-500">{t("products.status")}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    product.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.isActive
                    ? t("products.active")
                    : t("products.inactive")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("products.variants")}</span>
                <span>{variants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("products.options")}</span>
                <span>{options.length}</span>
              </div>
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
