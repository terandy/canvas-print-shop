import { Product, ProductVariant } from "@/lib/shopify/types";

/**
 * Form values for customizing a canvas
 */
export type FormState = { [key: string]: string };

interface BaseFormState extends FormState {
  direction: "landscape" | "portrait";
  /**
   * URL of the image
   *
   * Image is saved in aws s3
   */
  imgURL: string;
  size: string; // 8x10;
  depth: "regular" | "gallery";
}

export interface CanvasFormState extends BaseFormState {
  borderStyle: "black" | "white" | "wrapped" | "fill";
  frame: "none" | "black";
}

export interface CanvasRollFormState extends BaseFormState {}

export type TProductContext = {
  cartItemID: string | null;
  imgFileUrl: string | null;
  product: Product;
  /**
   * Form values as selected by the user
   */
  state: FormState;
  variant: ProductVariant;
  deleteImgURL: () => void;
  setImgFileUrl: React.Dispatch<React.SetStateAction<string | null>>;
  updateField: <U extends keyof FormState>(
    name: U,
    value: FormState[U]
  ) => FormState;
  /**
   * Handles updating the state value
   *
   * @param updates - partial form state to update the state with
   */
  updateState: (updates: FormState) => void;
};
