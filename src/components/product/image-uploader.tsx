"use client";

import React, { useState, useCallback, startTransition } from "react";
import clsx from "clsx";
import { Upload } from "lucide-react";
import ImageFile from "./image-file";
import { useProduct } from "@/contexts/product-context";

interface ImageUploaderProps {
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className,
}) => {
  const {
    updateField,
    state: { imgURL },
  } = useProduct();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageSelect = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Get presigned URL
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileType: file.type }),
        });
        const { uploadUrl, publicUrl } = await response.json();

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
          console.log("onload", { publicUrl });
          if (xhr.status === 200) {
            updateField("imgURL", publicUrl);
          } else {
            setError("Upload failed. Please try again.");
          }
          setIsUploading(false);
        };

        // Handle errors
        xhr.onerror = () => {
          setError("Upload failed. Please try again.");
          setIsUploading(false);
        };

        // Send the request
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Upload failed. Please try again.");
        setIsUploading(false);
      }
    },
    [updateField]
  );

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        setError(`Accepted file types: ${acceptedTypes.join(", ")}`);
        return false;
      }

      return true;
    },
    [setError, acceptedTypes]
  );

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (!validateFile(file)) {
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.readAsDataURL(file);
      handleImageSelect(file);
    },
    [handleImageSelect, validateFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  if (imgURL !== "/default-image.jpeg") return <ImageFile imgURL={imgURL} />;

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
                Drop your image here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: JPG, PNG, WebP
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
            <p className="text-sm font-medium text-primary">Uploading...</p>
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
