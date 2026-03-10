"use client";

import { useActionState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, ExternalLink, Upload, X, ImageIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import {
  createCustomOrderAction,
  type CustomOrderFormState,
} from "@/lib/db/actions/custom-orders";
import { uploadImage } from "@/lib/s3/actions/image";

const INITIAL_STATE: CustomOrderFormState = {};
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function CustomOrderForm() {
  const t = useTranslations("Admin.customOrder");
  const [state, formAction, isPending] = useActionState(
    createCustomOrderAction,
    INITIAL_STATE
  );
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCopy = async () => {
    if (state.paymentUrl) {
      await navigator.clipboard.writeText(state.paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageUpload = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError(t("imageTypeError"));
      return;
    }

    setUploadError(null);
    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { uploadUrl, publicUrl } = await uploadImage(
        JSON.stringify({ fileType: file.type })
      );

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setImageUrl(publicUrl);
          setIsUploading(false);
        } else {
          setUploadError(t("imageUploadFailed"));
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        setUploadError(t("imageUploadFailed"));
        setIsUploading(false);
      };

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch {
      setUploadError(t("imageUploadFailed"));
      setIsUploading(false);
    }
  }, [t]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    setUploadError(null);
  };

  return (
    <div className="max-w-2xl">
      {state.success && state.paymentUrl ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
            <p className="font-medium">{t("successTitle")}</p>
            <p className="text-sm mt-1">{t("successMessage")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("paymentLink")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={state.paymentUrl}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1 text-sm"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {t("copy")}
                  </>
                )}
              </button>
              <a
                href={state.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                {t("open")}
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            {t("createAnother")}
          </button>
        </div>
      ) : (
        <form ref={formRef} action={formAction} className="bg-white rounded-lg shadow p-6 space-y-4">
          {state.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          <input type="hidden" name="locale" value="en" />
          <input type="hidden" name="imageUrl" value={imageUrl || ""} />

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("description")} *
            </label>
            <input
              id="description"
              name="description"
              type="text"
              required
              placeholder={t("descriptionPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="customerEmail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("customerEmail")} *
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              required
              placeholder={t("customerEmailPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="customSize"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("customSize")}
            </label>
            <input
              id="customSize"
              name="customSize"
              type="text"
              placeholder={t("customSizePlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500">{t("customSizeHint")}</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("image")}
            </label>

            {imageUrl || imagePreview ? (
              <div className="relative inline-block">
                <div className="relative w-40 h-40 rounded-md overflow-hidden border border-gray-300">
                  <Image
                    src={imageUrl || imagePreview || ""}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  {isDragging ? (
                    <ImageIcon className="h-8 w-8 text-primary" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                  <p className="text-sm text-gray-600">{t("imageDropzone")}</p>
                  <p className="text-xs text-gray-400">{t("imageFormats")}</p>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="mt-2 text-sm text-red-500">{uploadError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("price")} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="shipping"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("shipping")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  id="shipping"
                  name="shipping"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue="0"
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? t("creating") : t("createLink")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
