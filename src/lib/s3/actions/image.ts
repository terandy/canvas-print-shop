"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
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

export async function uploadImage(request: NextRequest) {
  try {
    const { fileType } = await request.json();

    // Generate unique filename
    const fileName = `${crypto.randomBytes(16).toString("hex")}-${Date.now()}`;
    const key = `uploads/${fileName}${fileType.startsWith(".") ? fileType : "." + fileType}`;

    // Create presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: fileType,
      ACL: "public-read", // Make the uploaded object publicly readable
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({
      uploadUrl: presignedUrl,
      key: key,
      // The URL where the image will be accessible after upload
      publicUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { message: "Error generating upload URL" },
      { status: 500 }
    );
  }
}
