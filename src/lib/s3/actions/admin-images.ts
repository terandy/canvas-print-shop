"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { deleteImage } from "./image";

interface DeleteResult {
  error?: string;
  success?: boolean;
  deletedCount?: number;
}

export async function deleteOrphanedImageAction(
  imageUrl: string
): Promise<DeleteResult> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await deleteImage(imageUrl);
    if (!result) {
      return { error: "Failed to delete image from S3" };
    }

    revalidatePath("/admin/images");
    return { success: true, deletedCount: 1 };
  } catch (error) {
    console.error("Error deleting orphaned image:", error);
    return { error: "Failed to delete image" };
  }
}

export async function deleteAllOrphanedImagesAction(
  imageUrls: string[]
): Promise<DeleteResult> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  if (imageUrls.length === 0) {
    return { error: "No images to delete" };
  }

  try {
    let deletedCount = 0;
    const errors: string[] = [];

    for (const url of imageUrls) {
      const result = await deleteImage(url);
      if (result) {
        deletedCount++;
      } else {
        errors.push(url);
      }
    }

    revalidatePath("/admin/images");

    if (errors.length > 0) {
      return {
        success: true,
        deletedCount,
        error: `Failed to delete ${errors.length} image(s)`,
      };
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error("Error deleting orphaned images:", error);
    return { error: "Failed to delete images" };
  }
}
