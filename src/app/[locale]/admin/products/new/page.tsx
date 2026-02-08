import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/product-form";

export default async function AdminNewProductPage() {
  const t = await getTranslations("Admin");

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
        <h1 className="text-2xl font-bold text-gray-900">
          {t("products.addProduct")}
        </h1>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6">
          <ProductForm />
        </div>

        <p className="mt-4 text-sm text-gray-500">
          After creating the product, you can add options and variants with
          pricing.
        </p>
      </div>
    </div>
  );
}
