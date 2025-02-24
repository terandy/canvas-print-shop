import {
  CanvasLineItem,
  CanvasRollLineItem,
  Cart,
  LineItem,
  Money,
  ProductVariant,
} from "@/lib/shopify/types";
import { FormState } from "../product-context";

/**
 * The line item in the cart
 */
interface AbstractCartItem<U extends string, T extends LineItem = LineItem> {
  title: U;
  imgURL: string;
  id: string;
  quantity: number;
  totalAmount: Money;
  variantID: ProductVariant["id"];
  attributes: T["attributes"];
  selectedOptions: T["merchandise"]["selectedOptions"];
}

export type CanvasCartItem = AbstractCartItem<"Canvas", CanvasLineItem>;
export type CanvasRollCartItem = AbstractCartItem<
  "Canvas Roll",
  CanvasRollLineItem
>;

export type CartItem = CanvasCartItem | CanvasRollCartItem; // Add more types later

export interface CartState extends Pick<Cart, "id" | "cost" | "totalQuantity"> {
  items: Record<CartItem["id"], CartItem>;
}

export type UpdateQuantityType = "plus" | "minus" | "delete";

export type TCartContext = {
  state: CartState | undefined;
  addCanvasCartItem: (
    FormState: FormState,
    variant: ProductVariant
  ) => CartState;
  updateCanvasCartItem: (
    cartItemID: CanvasCartItem["id"],
    updates: Partial<FormState>,
    variant: ProductVariant
  ) => CartState;
  updateCartItemQuantity: (
    cartItemID: CartItem["id"],
    action: UpdateQuantityType
  ) => CartState;
};
