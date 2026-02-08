import type { Money } from "@/types/common";
import type { ProductVariant } from "@/types/product";
import { FormState } from "../product-context";
import { Dispatch, SetStateAction } from "react";

/**
 * Attribute for cart item (non-price options)
 */
export type Attribute = {
  key: string;
  value: string;
};

/**
 * The line item in the cart
 */
export interface CartItem {
  title: string;
  imgURL: string;
  id: string;
  quantity: number;
  totalAmount: Money;
  variantID: string;
  attributes: Attribute[];
  selectedOptions: Record<string, string>;
}

export interface CartState {
  id: string | undefined;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  totalQuantity: number;
  items: Record<CartItem["id"], CartItem>;
}

export type UpdateQuantityType = "plus" | "minus" | "delete";

export type TCartContext = {
  state: CartState | undefined;
  addCartItem: (
    FormState: FormState,
    variant: ProductVariant,
    productHandle: string
  ) => CartState;
  updateCartItem: (
    cartItemID: CartItem["id"],
    updates: FormState,
    variant: ProductVariant
  ) => CartState;
  updateCartItemQuantity: (
    cartItemID: CartItem["id"],
    action: UpdateQuantityType
  ) => CartState;
  /**
   * Clears all items from the cart
   */
  clearCart: () => void;
  /**
   * True if cart modal is visible
   */
  isOpen: boolean;
  /**
   * Controls the visibility of the cart modal
   */
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};
