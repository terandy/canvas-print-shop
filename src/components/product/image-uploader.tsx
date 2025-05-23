"use client";

import React, { useState, useCallback, startTransition } from "react";
import clsx from "clsx";
import { Upload } from "lucide-react";
import ImageFile from "./image-file";
import { useProduct } from "@/contexts/product-context";
import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { uploadImage } from "@/lib/s3/actions/image";

interface ImageUploaderProps {
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className,
}) => {
  // Get translations for this component
  const t = useTranslations("ImageUploader");

  const {
    updateField,
    setImgFileUrl,
    state: { imgURL },
  } = useProduct();

  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageSelect = async (file: File) => {
    setImgFileUrl(URL.createObjectURL(file));
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Get presigned URL
      const { uploadUrl, publicUrl } = await uploadImage(
        JSON.stringify({ fileType: file.type })
      );

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      // Handle completion
      xhr.onload = () => {
        if (xhr.status === 200) {
          updateField("imgURL", publicUrl);
          setImgFileUrl(null);
        } else {
          setError(t("errors.uploadFailed"));
        }
        setIsUploading(false);
      };

      // Handle errors
      xhr.onerror = () => {
        setError(t("errors.uploadFailed"));
        setIsUploading(false);
      };

      // Send the request
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(t("errors.uploadFailed"));
      setIsUploading(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      setError(t("errors.fileType", { types: acceptedTypes.join(", ") }));
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    setError(null);

    if (!validateFile(file)) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    handleImageSelect(file);
  };

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
    if (file) {
      handleFile(file);
    }
  };

  if (imgURL !== DEFAULT_CANVAS_IMAGE) return <ImageFile imgURL={imgURL} />;

  return (
    <div className={clsx("w-full max-w-xl mx-auto", className)}>
      {!isUploading && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={clsx(
            "relative border-2 border-dashed rounded-lg p-8 text-center",
            "transition-all duration-200 ease-in-out",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-gray/300 hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          <input
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center">
            <div>
              <p className="text-base font-medium text-gray/70">
                {t("dropzone.mainText")}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t("dropzone.supportedFormats")}
              </p>
            </div>
            <Upload
              className={clsx(
                "w-12 h-12 mx-auto transition-colors duration-200",
                isDragging ? "text-primary" : "text-gray/40"
              )}
            />
          </div>
        </div>
      )}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium text-primary">
              {t("uploading.status")}
            </p>
            <span className="text-sm font-medium text-primary">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-md p-2.5 border border-red-100">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
