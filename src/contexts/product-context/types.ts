import { ProductVariant } from "@/lib/shopify/types";

/**
 * Form values for customizing a canvas
 */
export interface FormState {
  cartItemID: string | null;
  borderStyle: "black" | "white" | "wrapped" | "fill";
  direction: "landscape" | "portrait";
  /**
   * URL of the image
   *
   * Image is saved in aws s3
   */
  imgURL: string;
  frame: "none" | "black";
  size: string; // 8x10;
}

export type TProductContext = {
  /**
   * Form values as selected by the user
   */
  state: FormState;
  variant: ProductVariant;
  imgFileUrl: string | null;
  setImgFileUrl: React.Dispatch<React.SetStateAction<string | null>>;
  updateField: (name: keyof FormState, value: string) => FormState;
  updateState: (updates: Partial<FormState>) => void;
  deleteImgURL: () => {};
};

/**
 * Product attributes as defined in the codebase
 *
 * Shopify allows us to add attributes to a cart item.
 *
 */
export type AttributeKey = "borderStyle" | "direction" | "imgURL";

/**
 * Product options as defined in shopify
 *
 * These are options defined in the shopify storefront.
 * We can add prices to each corresponding option.
 * But we are limited to 100 options total, and 3 types, which is why attributes
 */
export type OptionName = "Size" | "Frame";
