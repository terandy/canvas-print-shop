"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  ImageIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import type { ImageAssociation } from "@/lib/db/queries/images";
import {
  deleteOrphanedImageAction,
  deleteAllOrphanedImagesAction,
} from "@/lib/s3/actions/admin-images";

export interface S3ImageWithAssociations {
  key: string;
  url: string;
  lastModified: string | null;
  size: number | undefined;
  associations: ImageAssociation[];
  status: "order" | "cart" | "product" | "orphaned";
}

interface ImageGalleryProps {
  images: S3ImageWithAssociations[];
  orphanedUrls: string[];
  currentFilter: string;
  counts: {
    all: number;
    order: number;
    cart: number;
    product: number;
    orphaned: number;
  };
}

const FILTER_VALUES = ["", "order", "cart", "product", "orphaned"] as const;

export default function ImageGallery({
  images,
  orphanedUrls,
  currentFilter,
  counts,
}: ImageGalleryProps) {
  const t = useTranslations("Admin.images");
  const router = useRouter();
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleDeleteSingle = async (url: string) => {
    if (!confirm(t("confirmDelete"))) return;

    setDeletingUrl(url);
    try {
      const result = await deleteOrphanedImageAction(url);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } catch {
      alert(t("deleteFailed"));
    } finally {
      setDeletingUrl(null);
    }
  };

  const handleDeleteAllOrphaned = async () => {
    if (
      !confirm(t("confirmDeleteAll", { count: orphanedUrls.length }))
    )
      return;

    setIsBulkDeleting(true);
    try {
      const result = await deleteAllOrphanedImagesAction(orphanedUrls);
      if (result.error && !result.success) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } catch {
      alert(t("deleteFailed"));
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getStatusBadge = (image: S3ImageWithAssociations) => {
    switch (image.status) {
      case "order": {
        const orderAssoc = image.associations.find((a) => a.type === "order");
        const orderNumber =
          orderAssoc?.type === "order" ? orderAssoc.orderNumber : "";
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            <ShoppingCart className="w-3 h-3 mr-1" />#{orderNumber}
          </span>
        );
      }
      case "cart":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            <ShoppingCart className="w-3 h-3 mr-1" />
            {t("cart")}
          </span>
        );
      case "product":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <Package className="w-3 h-3 mr-1" />
            {t("product")}
          </span>
        );
      case "orphaned":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {t("orphaned")}
          </span>
        );
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_VALUES.map((f) => {
              const label =
                f === "" ? t("allImages") : t(`filter.${f}`);
              const count =
                f === "" ? counts.all : counts[f as keyof typeof counts];
              return (
                <Link
                  key={f}
                  href={f ? `?filter=${f}` : "?"}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    currentFilter === f
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label} ({count})
                </Link>
              );
            })}
          </div>

          {orphanedUrls.length > 0 && (
            <button
              onClick={handleDeleteAllOrphaned}
              disabled={isBulkDeleting}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {isBulkDeleting
                ? t("deleting")
                : t("deleteAllOrphaned", { count: orphanedUrls.length })}
            </button>
          )}
        </div>
      </div>

      {/* Image Grid */}
      {images.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>{t("noImages")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image) => (
            <div
              key={image.key}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="aspect-square bg-gray-100 relative">
                <Image
                  src={image.url}
                  alt={image.key}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  unoptimized
                />
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  {getStatusBadge(image)}
                  {image.status === "orphaned" && (
                    <button
                      onClick={() => handleDeleteSingle(image.url)}
                      disabled={deletingUrl === image.url}
                      className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                      title={t("delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400 truncate" title={image.key}>
                  {image.key.replace("uploads/", "")}
                </p>
                {image.lastModified && (
                  <p className="text-xs text-gray-500 truncate">
                    {new Date(image.lastModified).toLocaleDateString()}
                  </p>
                )}
                {image.size !== undefined && (
                  <p className="text-xs text-gray-400">
                    {(image.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
