import type { Product, ProductVariant } from "@/types/product";

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
  borderStyle: "wrapped" | "fill";
  frame: "none" | "black";
}

/**
 * A rolled print has no frame and is never stretched, so it carries neither a
 * frame nor a depth. It does carry a margin: whether to leave 2in of blank
 * canvas around the image for the customer to stretch it themselves later.
 */
export interface CanvasRollFormState extends Omit<BaseFormState, "depth"> {
  borderStyle: "none";
  margin: "with" | "without";
}

export type TProductContext = {
  cartItemID: string | null;
  imgFileUrl: string | null;
  product: Product;
  /**
   * Form values as selected by the user
   */
  state: FormState;
  variant: ProductVariant | undefined;
  /**
   * Deletes imgURL from the product's form state
   */
  deleteImgURL: () => void;
  /**
   * Saves imgURL to the product's form state
   */
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
