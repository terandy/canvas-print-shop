import { eq, and } from "drizzle-orm";
import { db } from "../index";
import {
  products,
  productImages,
  productOptions,
  productVariants,
} from "../schema";
import type { Product, ProductOption, ProductVariant } from "@/types/product";
import type { Image, Money } from "@/types/common";

type Locale = "en" | "fr";

// Helper to format cents to Money
function formatMoney(cents: number, currency = "CAD"): Money {
  return {
    amount: (cents / 100).toFixed(2),
    currencyCode: currency,
  };
}

// Get a single product by handle with all related data
export async function getProduct(
  handle: string,
  locale: Locale = "en"
): Promise<Product | undefined> {
  // Fetch product
  const [productRow] = await db
    .select()
    .from(products)
    .where(and(eq(products.handle, handle), eq(products.isActive, true)));

  if (!productRow) return undefined;

  // Fetch related data in parallel
  const [images, options, variants] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productRow.id))
      .orderBy(productImages.sortOrder),
    db
      .select()
      .from(productOptions)
      .where(eq(productOptions.productId, productRow.id))
      .orderBy(productOptions.sortOrder),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productRow.id)),
  ]);

  // Format images
  const formattedImages: Image[] = images.map((img) => ({
    url: img.url,
    altText: img.altText || productRow.titleEn,
    width: img.width ?? undefined,
    height: img.height ?? undefined,
  }));

  // Format options
  const formattedOptions: ProductOption[] = options.map((opt) => ({
    name: opt.name,
    values: opt.values || [],
    affectsPrice: opt.affectsPrice ?? true,
  }));

  // Format variants
  const formattedVariants: ProductVariant[] = variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    title: v.title,
    priceCents: v.priceCents,
    price: formatMoney(v.priceCents, v.currency || "CAD"),
    availableForSale: v.availableForSale ?? true,
    options: v.options,
  }));

  // Calculate price range
  const prices = formattedVariants.map((v) => v.priceCents);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Get locale-specific fields
  const title =
    locale === "fr" ? productRow.titleFr || productRow.titleEn : productRow.titleEn;
  const description =
    locale === "fr"
      ? productRow.descriptionFr || productRow.descriptionEn
      : productRow.descriptionEn;
  const descriptionHtml =
    locale === "fr"
      ? productRow.descriptionHtmlFr || productRow.descriptionHtmlEn
      : productRow.descriptionHtmlEn;
  const seoTitle =
    locale === "fr"
      ? productRow.seoTitleFr || productRow.seoTitleEn
      : productRow.seoTitleEn;
  const seoDescription =
    locale === "fr"
      ? productRow.seoDescriptionFr || productRow.seoDescriptionEn
      : productRow.seoDescriptionEn;

  // Build featured image
  const featuredImage: Image = productRow.featuredImageUrl
    ? {
        url: productRow.featuredImageUrl,
        altText: title,
      }
    : formattedImages[0] || { url: "", altText: title };

  return {
    id: productRow.id,
    handle: productRow.handle,
    title,
    description: description || "",
    descriptionHtml: descriptionHtml || "",
    featuredImage,
    images: formattedImages,
    seo: {
      title: seoTitle || title,
      description: seoDescription || description || "",
    },
    tags: productRow.tags || [],
    options: formattedOptions,
    variants: formattedVariants,
    priceRange: {
      minVariantPrice: formatMoney(minPrice),
      maxVariantPrice: formatMoney(maxPrice),
    },
    updatedAt: productRow.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// Get all products
export async function getProductList(locale: Locale = "en"): Promise<Product[]> {
  const productRows = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true));

  const productList = await Promise.all(
    productRows.map((p) => getProduct(p.handle, locale))
  );

  return productList.filter((p): p is Product => p !== undefined);
}

// Get a single variant by ID
export async function getVariant(variantId: string) {
  const [variant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, variantId));

  if (!variant) return undefined;

  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    title: variant.title,
    priceCents: variant.priceCents,
    price: formatMoney(variant.priceCents, variant.currency || "CAD"),
    availableForSale: variant.availableForSale ?? true,
    options: variant.options,
  };
}

// Find variant matching selected options
export async function findVariant(
  productId: string,
  selectedOptions: Record<string, string>
): Promise<ProductVariant | undefined> {
  // Get all variants for this product
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  // Find variant where options match
  // We need to check if the variant's options contain all the selected options
  const matchingVariant = variants.find((v) => {
    const variantOptions = v.options;
    return Object.entries(selectedOptions).every(
      ([key, value]) => variantOptions[key] === value
    );
  });

  if (!matchingVariant) return undefined;

  return {
    id: matchingVariant.id,
    sku: matchingVariant.sku,
    title: matchingVariant.title,
    priceCents: matchingVariant.priceCents,
    price: formatMoney(matchingVariant.priceCents, matchingVariant.currency || "CAD"),
    availableForSale: matchingVariant.availableForSale ?? true,
    options: matchingVariant.options,
  };
}

// Get variant with product info (for cart display)
export async function getVariantWithProduct(variantId: string) {
  const [result] = await db
    .select({
      variant: productVariants,
      product: products,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(productVariants.id, variantId));

  if (!result) return undefined;

  return {
    variant: {
      id: result.variant.id,
      sku: result.variant.sku,
      title: result.variant.title,
      priceCents: result.variant.priceCents,
      price: formatMoney(result.variant.priceCents, result.variant.currency || "CAD"),
      availableForSale: result.variant.availableForSale ?? true,
      options: result.variant.options,
    },
    product: {
      id: result.product.id,
      handle: result.product.handle,
      title: result.product.titleEn,
      featuredImageUrl: result.product.featuredImageUrl,
    },
  };
}
