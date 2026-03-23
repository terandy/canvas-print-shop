"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  products,
  productVariants,
  productOptions,
  productImages,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth/session";

// ============================================
// PRODUCT ACTIONS
// ============================================

export interface ProductFormState {
  error?: string;
  success?: boolean;
  productId?: string;
}

export async function createProductAction(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const handle = formData.get("handle") as string;
  const titleEn = formData.get("titleEn") as string;
  const titleFr = (formData.get("titleFr") as string) || null;
  const descriptionEn = (formData.get("descriptionEn") as string) || null;
  const descriptionFr = (formData.get("descriptionFr") as string) || null;
  const descriptionHtmlEn = (formData.get("descriptionHtmlEn") as string) || null;
  const descriptionHtmlFr = (formData.get("descriptionHtmlFr") as string) || null;
  const featuredImageUrl = (formData.get("featuredImageUrl") as string) || null;
  const isActive = formData.get("isActive") === "true";
  const seoTitleEn = (formData.get("seoTitleEn") as string) || null;
  const seoTitleFr = (formData.get("seoTitleFr") as string) || null;
  const seoDescriptionEn = (formData.get("seoDescriptionEn") as string) || null;
  const seoDescriptionFr = (formData.get("seoDescriptionFr") as string) || null;

  if (!handle || !titleEn) {
    return { error: "Handle and English title are required" };
  }

  // Validate handle format
  if (!/^[a-z0-9-]+$/.test(handle)) {
    return { error: "Handle must contain only lowercase letters, numbers, and hyphens" };
  }

  try {
    const [newProduct] = await db
      .insert(products)
      .values({
        handle,
        titleEn,
        titleFr,
        descriptionEn,
        descriptionFr,
        descriptionHtmlEn,
        descriptionHtmlFr,
        featuredImageUrl,
        isActive,
        seoTitleEn,
        seoTitleFr,
        seoDescriptionEn,
        seoDescriptionFr,
      })
      .returning();

    revalidatePath("/admin/products");
    return { success: true, productId: newProduct.id };
  } catch (error: any) {
    if (error.code === "23505") {
      return { error: "A product with this handle already exists" };
    }
    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
}

export async function updateProductAction(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const productId = formData.get("productId") as string;
  const handle = formData.get("handle") as string;
  const titleEn = formData.get("titleEn") as string;
  const titleFr = (formData.get("titleFr") as string) || null;
  const descriptionEn = (formData.get("descriptionEn") as string) || null;
  const descriptionFr = (formData.get("descriptionFr") as string) || null;
  const descriptionHtmlEn = (formData.get("descriptionHtmlEn") as string) || null;
  const descriptionHtmlFr = (formData.get("descriptionHtmlFr") as string) || null;
  const featuredImageUrl = (formData.get("featuredImageUrl") as string) || null;
  const isActive = formData.get("isActive") === "true";
  const seoTitleEn = (formData.get("seoTitleEn") as string) || null;
  const seoTitleFr = (formData.get("seoTitleFr") as string) || null;
  const seoDescriptionEn = (formData.get("seoDescriptionEn") as string) || null;
  const seoDescriptionFr = (formData.get("seoDescriptionFr") as string) || null;

  if (!productId || !handle || !titleEn) {
    return { error: "Product ID, handle, and English title are required" };
  }

  try {
    await db
      .update(products)
      .set({
        handle,
        titleEn,
        titleFr,
        descriptionEn,
        descriptionFr,
        descriptionHtmlEn,
        descriptionHtmlFr,
        featuredImageUrl,
        isActive,
        seoTitleEn,
        seoTitleFr,
        seoDescriptionEn,
        seoDescriptionFr,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/product/${handle}`);
    return { success: true, productId };
  } catch (error: any) {
    if (error.code === "23505") {
      return { error: "A product with this handle already exists" };
    }
    console.error("Error updating product:", error);
    return { error: "Failed to update product" };
  }
}

export async function deleteProductAction(productId: string): Promise<{ error?: string; success?: boolean }> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(products).where(eq(products.id, productId));
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product" };
  }
}

// ============================================
// VARIANT ACTIONS
// ============================================

export interface VariantFormState {
  error?: string;
  success?: boolean;
  variantId?: string;
}

export async function createVariantAction(
  prevState: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const productId = formData.get("productId") as string;
  const title = formData.get("title") as string;
  const sku = (formData.get("sku") as string) || null;
  const priceStr = formData.get("price") as string;
  const optionsJson = formData.get("options") as string;

  if (!productId || !title || !priceStr) {
    return { error: "Product ID, title, and price are required" };
  }

  const priceCents = Math.round(parseFloat(priceStr) * 100);
  if (isNaN(priceCents) || priceCents < 0) {
    return { error: "Invalid price" };
  }

  let options: Record<string, string> = {};
  try {
    options = optionsJson ? JSON.parse(optionsJson) : {};
  } catch {
    return { error: "Invalid options format" };
  }

  try {
    const [newVariant] = await db
      .insert(productVariants)
      .values({
        productId,
        title,
        sku,
        priceCents,
        options,
        availableForSale: true,
      })
      .returning();

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, variantId: newVariant.id };
  } catch (error) {
    console.error("Error creating variant:", error);
    return { error: "Failed to create variant" };
  }
}

export async function updateVariantAction(
  prevState: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const variantId = formData.get("variantId") as string;
  const productId = formData.get("productId") as string;
  const title = formData.get("title") as string;
  const sku = (formData.get("sku") as string) || null;
  const priceStr = formData.get("price") as string;
  const optionsJson = formData.get("options") as string;
  const availableForSale = formData.get("availableForSale") === "true";

  if (!variantId || !title || !priceStr) {
    return { error: "Variant ID, title, and price are required" };
  }

  const priceCents = Math.round(parseFloat(priceStr) * 100);
  if (isNaN(priceCents) || priceCents < 0) {
    return { error: "Invalid price" };
  }

  let options: Record<string, string> = {};
  try {
    options = optionsJson ? JSON.parse(optionsJson) : {};
  } catch {
    return { error: "Invalid options format" };
  }

  try {
    await db
      .update(productVariants)
      .set({
        title,
        sku,
        priceCents,
        options,
        availableForSale,
      })
      .where(eq(productVariants.id, variantId));

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, variantId };
  } catch (error) {
    console.error("Error updating variant:", error);
    return { error: "Failed to update variant" };
  }
}

export async function deleteVariantAction(
  variantId: string,
  productId: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(productVariants).where(eq(productVariants.id, variantId));
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting variant:", error);
    return { error: "Failed to delete variant" };
  }
}

// ============================================
// OPTION ACTIONS
// ============================================

export interface OptionFormState {
  error?: string;
  success?: boolean;
  optionId?: string;
}

export async function createOptionAction(
  prevState: OptionFormState,
  formData: FormData
): Promise<OptionFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const valuesStr = formData.get("values") as string;
  const affectsPrice = formData.get("affectsPrice") === "true";

  if (!productId || !name || !valuesStr) {
    return { error: "Product ID, name, and values are required" };
  }

  const values = valuesStr.split(",").map((v) => v.trim()).filter(Boolean);
  if (values.length === 0) {
    return { error: "At least one value is required" };
  }

  try {
    const [newOption] = await db
      .insert(productOptions)
      .values({
        productId,
        name,
        values,
        affectsPrice,
      })
      .returning();

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, optionId: newOption.id };
  } catch (error) {
    console.error("Error creating option:", error);
    return { error: "Failed to create option" };
  }
}

export async function updateOptionAction(
  prevState: OptionFormState,
  formData: FormData
): Promise<OptionFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const optionId = formData.get("optionId") as string;
  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const valuesStr = formData.get("values") as string;
  const affectsPrice = formData.get("affectsPrice") === "true";

  if (!optionId || !name || !valuesStr) {
    return { error: "Option ID, name, and values are required" };
  }

  const values = valuesStr.split(",").map((v) => v.trim()).filter(Boolean);
  if (values.length === 0) {
    return { error: "At least one value is required" };
  }

  try {
    await db
      .update(productOptions)
      .set({
        name,
        values,
        affectsPrice,
      })
      .where(eq(productOptions.id, optionId));

    revalidatePath(`/admin/products/${productId}`);
    return { success: true, optionId };
  } catch (error) {
    console.error("Error updating option:", error);
    return { error: "Failed to update option" };
  }
}

export async function deleteOptionAction(
  optionId: string,
  productId: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(productOptions).where(eq(productOptions.id, optionId));
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting option:", error);
    return { error: "Failed to delete option" };
  }
}
