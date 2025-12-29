import type { Image, Money, SEO } from "./common";

export interface Product {
  id: string;
  handle: string;
  title: string; // Locale-resolved
  description: string; // Locale-resolved
  descriptionHtml: string; // Locale-resolved
  featuredImage: Image;
  images: Image[];
  seo: SEO;
  tags: string[];
  options: ProductOption[]; // Flexible per product type
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  updatedAt: string;
}

export interface ProductOption {
  name: string; // "dimension", "frame", "depth", "border_style"
  values: string[]; // ["8x10", "11x14", ...]
  affectsPrice: boolean; // true for dimension/frame/depth, false for border_style
}

export interface ProductVariant {
  id: string;
  sku: string | null;
  title: string; // "8x10 / black / gallery"
  priceCents: number;
  price: Money; // Formatted for display
  availableForSale: boolean;
  // Flexible options: { dimension: "8x10", frame: "black", depth: "gallery" }
  options: Record<string, string>;
}

// Type for selected options when user picks from dropdowns
export type SelectedOptions = Record<string, string>;
