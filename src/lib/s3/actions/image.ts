"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

import { s3Client } from "../s3Client";

export async function deleteImage(url: string) {
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
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    // Add more as needed
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
    svg: "image/svg+xml",
    pdf: "application/pdf",
    // Add more as needed
  };

  return extToMime[extension.toLowerCase()] || "application/octet-stream";
}
