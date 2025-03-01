import { Cart, LineItem, Money, ProductVariant } from "@/lib/shopify/types";
import { FormState } from "../product-context";

/**
 * The line item in the cart
 */
export interface CartItem<T extends LineItem = LineItem> {
  title: string;
  imgURL: string;
  id: string;
  quantity: number;
  totalAmount: Money;
  variantID: ProductVariant["id"];
  attributes: T["attributes"];
  selectedOptions: T["merchandise"]["selectedOptions"];
}

export interface CartState extends Pick<Cart, "id" | "cost" | "totalQuantity"> {
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
};
