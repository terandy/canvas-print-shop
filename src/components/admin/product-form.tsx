"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/lib/db/actions/products";

const SEO_TITLE_MAX = 60;
const SEO_DESC_MAX = 160;

function charCountColor(len: number, max: number) {
  if (len === 0) return "text-gray-400";
  if (len <= max) return "text-green-600";
  return "text-red-600";
}

function SeoPreview({
  title,
  description,
  handle,
}: {
  title: string;
  description: string;
  handle: string;
}) {
  const t = useTranslations("Admin.productForm");
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {t("seoPreview")}
      </p>
      <div className="space-y-0.5">
        <p className="text-sm text-green-700 truncate">
          yourstore.com/product/{handle || "..."}
        </p>
        <p className="text-lg font-medium text-blue-800 leading-snug line-clamp-1">
          {title || t("seoPreviewTitlePlaceholder")}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description || t("seoPreviewDescPlaceholder")}
        </p>
      </div>
    </div>
  );
}

interface ProductFormProps {
  product?: {
    id: string;
    handle: string;
    titleEn: string;
    titleFr: string | null;
    descriptionEn: string | null;
    descriptionFr: string | null;
    descriptionHtmlEn: string | null;
    descriptionHtmlFr: string | null;
    featuredImageUrl: string | null;
    isActive: boolean | null;
    seoTitleEn: string | null;
    seoTitleFr: string | null;
    seoDescriptionEn: string | null;
    seoDescriptionFr: string | null;
  };
}

const INITIAL_STATE: ProductFormState = {};

export default function ProductForm({ product }: ProductFormProps) {
  const t = useTranslations("Admin.productForm");
  const router = useRouter();
  const isEditing = !!product;

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateProductAction : createProductAction,
    INITIAL_STATE
  );

  const [seoTitleEn, setSeoTitleEn] = useState(product?.seoTitleEn || "");
  const [seoTitleFr, setSeoTitleFr] = useState(product?.seoTitleFr || "");
  const [seoDescEn, setSeoDescEn] = useState(product?.seoDescriptionEn || "");
  const [seoDescFr, setSeoDescFr] = useState(product?.seoDescriptionFr || "");
  const [handle, setHandle] = useState(product?.handle || "");
  const [seoOpen, setSeoOpen] = useState(false);

  useEffect(() => {
    if (state.success && state.productId && !isEditing) {
      router.push(`/admin/products/${state.productId}`);
    }
  }, [state.success, state.productId, isEditing, router]);

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="productId" value={product.id} />}

      {state.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
          {t("productSaved")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="handle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("handle")} *
          </label>
          <input
            id="handle"
            name="handle"
            type="text"
            required
            defaultValue={product?.handle || ""}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="canvas-prints"
            pattern="[a-z0-9-]+"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500">
            {t("handleHelp")}
          </p>
        </div>

        <div>
          <label
            htmlFor="isActive"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("statusLabel")}
          </label>
          <select
            id="isActive"
            name="isActive"
            defaultValue={product?.isActive !== false ? "true" : "false"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="true">{t("activeStatus")}</option>
            <option value="false">{t("inactiveStatus")}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="titleEn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("titleEn")} *
          </label>
          <input
            id="titleEn"
            name="titleEn"
            type="text"
            required
            defaultValue={product?.titleEn || ""}
            placeholder="Canvas Prints"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="titleFr"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("titleFr")}
          </label>
          <input
            id="titleFr"
            name="titleFr"
            type="text"
            defaultValue={product?.titleFr || ""}
            placeholder="Impressions sur toile"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="descriptionEn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("descriptionEn")}
          </label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            rows={4}
            defaultValue={product?.descriptionEn || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="descriptionFr"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("descriptionFr")}
          </label>
          <textarea
            id="descriptionFr"
            name="descriptionFr"
            rows={4}
            defaultValue={product?.descriptionFr || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="featuredImageUrl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t("featuredImageUrl")}
        </label>
        <input
          id="featuredImageUrl"
          name="featuredImageUrl"
          type="url"
          defaultValue={product?.featuredImageUrl || ""}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      {/* SEO Section - Yoast-style collapsible */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setSeoOpen(!seoOpen)}
          className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-900">
              {t("seoSectionTitle")}
            </span>
          </div>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${seoOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {seoOpen && (
          <div className="border-t border-gray-200 bg-white p-4 space-y-5">
            <p className="text-xs text-gray-500">{t("seoHelp")}</p>

            {/* English SEO */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-gray-700">
                {t("seoEnglish")}
              </legend>

              <div>
                <label
                  htmlFor="seoTitleEn"
                  className="block text-sm text-gray-600 mb-1"
                >
                  {t("seoTitle")}
                </label>
                <input
                  id="seoTitleEn"
                  name="seoTitleEn"
                  type="text"
                  value={seoTitleEn}
                  onChange={(e) => setSeoTitleEn(e.target.value)}
                  placeholder={t("seoTitlePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className={`mt-1 text-xs ${charCountColor(seoTitleEn.length, SEO_TITLE_MAX)}`}>
                  {seoTitleEn.length}/{SEO_TITLE_MAX} {t("characters")}
                </p>
              </div>

              <div>
                <label
                  htmlFor="seoDescriptionEn"
                  className="block text-sm text-gray-600 mb-1"
                >
                  {t("seoDescription")}
                </label>
                <textarea
                  id="seoDescriptionEn"
                  name="seoDescriptionEn"
                  rows={3}
                  value={seoDescEn}
                  onChange={(e) => setSeoDescEn(e.target.value)}
                  placeholder={t("seoDescriptionPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className={`mt-1 text-xs ${charCountColor(seoDescEn.length, SEO_DESC_MAX)}`}>
                  {seoDescEn.length}/{SEO_DESC_MAX} {t("characters")}
                </p>
              </div>

              <SeoPreview
                title={seoTitleEn}
                description={seoDescEn}
                handle={handle}
              />
            </fieldset>

            {/* French SEO */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-gray-700">
                {t("seoFrench")}
              </legend>

              <div>
                <label
                  htmlFor="seoTitleFr"
                  className="block text-sm text-gray-600 mb-1"
                >
                  {t("seoTitle")}
                </label>
                <input
                  id="seoTitleFr"
                  name="seoTitleFr"
                  type="text"
                  value={seoTitleFr}
                  onChange={(e) => setSeoTitleFr(e.target.value)}
                  placeholder={t("seoTitlePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className={`mt-1 text-xs ${charCountColor(seoTitleFr.length, SEO_TITLE_MAX)}`}>
                  {seoTitleFr.length}/{SEO_TITLE_MAX} {t("characters")}
                </p>
              </div>

              <div>
                <label
                  htmlFor="seoDescriptionFr"
                  className="block text-sm text-gray-600 mb-1"
                >
                  {t("seoDescription")}
                </label>
                <textarea
                  id="seoDescriptionFr"
                  name="seoDescriptionFr"
                  rows={3}
                  value={seoDescFr}
                  onChange={(e) => setSeoDescFr(e.target.value)}
                  placeholder={t("seoDescriptionPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className={`mt-1 text-xs ${charCountColor(seoDescFr.length, SEO_DESC_MAX)}`}>
                  {seoDescFr.length}/{SEO_DESC_MAX} {t("characters")}
                </p>
              </div>

              <SeoPreview
                title={seoTitleFr}
                description={seoDescFr}
                handle={handle}
              />
            </fieldset>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending
            ? t("saving")
            : isEditing
              ? t("saveChanges")
              : t("createProduct")}
        </button>
      </div>
    </form>
  );
}
