"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

import { s3Client } from "../s3Client";
import { UPLOADABLE_IMAGE_TYPES } from "@/lib/images/formats";

/**
 * Delete the image from aws
 *
 * @param url - URL of the image as found in aws
 *
 * @returns true if successful, or false if there is an error. It logs an error in the console if the action fails
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    const key = url.split(".amazonaws.com/")[1];
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error("Error deleting S3 image:", error);
    return false;
  }
}

/**
 * Check if an image exists in S3 via a HEAD request.
 *
 * @returns true if the image exists (2xx), false if not (403/404).
 *          Returns true on network errors to avoid removing items on transient failures.
 */
export async function checkImageExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return true;
  }
}

export async function uploadImage(fileType: string) {
  try {
    // Parse fileType to handle different input formats
    let mimeType: string;
    let extension: string | undefined;

    // Check if fileType is a JSON string (your current issue)
    if (fileType.includes("{")) {
      try {
        const parsed = JSON.parse(fileType);
        mimeType = parsed.fileType || "application/octet-stream";
      } catch {
        mimeType = "application/octet-stream";
      }
    } else if (fileType.includes("/")) {
      // It's already a MIME type like "image/jpeg"
      mimeType = fileType;
    } else {
      // It's just an extension like "jpeg" or ".jpeg"
      extension = fileType.replace(".", "");
      mimeType = getMimeType(extension);
    }

    // This action is callable by anyone, and the objects it signs for are
    // written public-read, so only hand out URLs for image types. Without this
    // the bucket would happily host uploaded HTML or SVG under our domain.
    if (!UPLOADABLE_IMAGE_TYPES.includes(mimeType.toLowerCase())) {
      throw new Error(`Unsupported upload type: ${mimeType}`);
    }

    // Extract extension from MIME type if not already set
    if (!extension) {
      extension = getExtensionFromMimeType(mimeType);
    }

    // Generate unique filename with proper extension
    const fileName = `${crypto.randomBytes(16).toString("hex")}-${Date.now()}`;
    const key = `uploads/${fileName}.${extension}`;

    // Create presigned URL with proper content type
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: mimeType,
      ACL: "public-read",
      Metadata: {
        uploadedAt: new Date().toISOString(),
        originalFileType: fileType, // Store original input for debugging
      },
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      uploadUrl: presignedUrl,
      key: key,
      publicUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Error generating upload URL");
  }
}

// Helper function to get extension from MIME type
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/heic": "heic",
    "image/heif": "heif",
  };

  return mimeToExt[mimeType.toLowerCase()] || mimeType.split("/")[1] || "bin";
}

// Helper function to get MIME type from extension
function getMimeType(extension: string): string {
  const extToMime: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    heic: "image/heic",
    heif: "image/heif",
  };

  return extToMime[extension.toLowerCase()] || "application/octet-stream";
}
