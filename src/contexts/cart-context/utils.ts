import type { Cart as DbCart, CartItem as DbCartItem } from "@/types/cart";
import type { ProductVariant } from "@/types/product";
import { CartState, CartItem, Attribute } from "./types";
import { FormState } from "../product-context";
import { v4 } from "uuid";
import { EMPTY_CART_STATE } from "./data";

// Convert DB cart item to context cart item
const getCartItem = (dbItem: DbCartItem): CartItem => {
  // Convert DB attributes to Attribute[] format
  const attributes: Attribute[] = [];
  if (dbItem.attributes.borderStyle) {
    attributes.push({ key: "borderStyle", value: dbItem.attributes.borderStyle });
  }
  if (dbItem.attributes.imageUrl) {
    attributes.push({ key: "imgURL", value: dbItem.attributes.imageUrl });
  }
  if (dbItem.attributes.orientation) {
    attributes.push({ key: "direction", value: dbItem.attributes.orientation });
  }

  const unitPrice = dbItem.priceCents / 100;
  const totalAmount = unitPrice * dbItem.quantity;

  return {
    title: dbItem.productHandle,
    imgURL: dbItem.attributes.imageUrl ?? "",
    id: dbItem.id,
    quantity: dbItem.quantity,
    totalAmount: {
      amount: totalAmount.toFixed(2),
      currencyCode: "CAD",
    },
    variantID: dbItem.variantId,
    attributes,
    selectedOptions: dbItem.selectedOptions,
  };
};

export const isSelectOption = (fieldName: string) => {
  return ["size", "frame"].includes(fieldName);
};
export const isAttribute = (fieldName: string) => {
  return ["borderStyle", "imgURL", "direction"].includes(fieldName);
};

export const getAttributes = (formState: {
  [key: string]: string;
}): Attribute[] => {
  return Object.entries(formState)
    .map(([key, value]) => {
      return { key, value };
    })
    .filter((item) => isAttribute(item.key));
};

export const getSelectOptions = (formState: {
  [key: string]: string;
}): CartItem["selectedOptions"] => {
  const result: Record<string, string> = {};
  Object.entries(formState).forEach(([key, value]) => {
    if (isSelectOption(key)) {
      result[key] = value;
    }
  });
  return result;
};

export const generateNewCartItem = (
  formState: FormState,
  productVariant: ProductVariant,
  producthandle: string
): CartItem => {
  return {
    id: v4(),
    title: producthandle,
    quantity: 1,
    totalAmount: productVariant.price,
    variantID: productVariant.id,
    attributes: getAttributes(formState),
    selectedOptions: getSelectOptions(formState),
    imgURL: formState.imgURL,
  };
};

export const toProductState = (cartItem: CartItem): FormState => {
  const interim: { [key: string]: string } = {};
  cartItem.attributes.forEach((attr) => (interim[attr.key] = attr.value));
  Object.entries(cartItem.selectedOptions).forEach(
    ([key, value]) => (interim[key] = value)
  );
  return interim;
};

export const generateUpdatedCartItem = (
  prevItem: CartItem,
  updates: FormState,
  productVariant: ProductVariant
): CartItem => {
  const prevAttributes = Object.fromEntries(
    prevItem.attributes.map((attr) => [attr.key, attr.value])
  );

  return {
    ...prevItem,
    totalAmount: productVariant.price,
    attributes: getAttributes({ ...prevAttributes, ...updates }),
    selectedOptions: getSelectOptions({
      ...prevItem.selectedOptions,
      ...productVariant.options,
    }),
    imgURL: prevAttributes.imgURL,
  };
};

export const generateUpdatedCartItemQuantity = (
  prevItem: CartItem,
  action: "plus" | "minus" | "delete"
): CartItem | null => {
  let quantity = prevItem.quantity;
  const price = Number(prevItem.totalAmount.amount) / quantity;
  switch (action) {
    case "plus":
      quantity += 1;
      break;
    case "minus":
      quantity -= 1;
      break;
    case "delete":
      quantity = 0;
      break;
    default:
      break;
  }

  const totalAmount = price * quantity;

  if (quantity === 0) return null;
  return {
    ...prevItem,
    quantity,
    totalAmount: {
      amount: totalAmount.toString(),
      currencyCode: prevItem.totalAmount.currencyCode,
    },
  };
};

export const getInitialState = (cart?: DbCart): CartState => {
  if (!cart) return { ...EMPTY_CART_STATE };
  const items: CartState["items"] = {};
  cart.items.forEach((item) => {
    items[item.id] = getCartItem(item);
  });
  return {
    id: cart.id,
    totalQuantity: cart.totalQuantity,
    cost: {
      subtotalAmount: cart.cost.subtotalAmount,
      totalAmount: cart.cost.totalAmount,
      totalTaxAmount: cart.cost.taxAmount,
    },
    items,
  };
};

export const generateCartTotals = (
  cartItems: CartState["items"]
): Pick<CartState, "cost" | "totalQuantity"> => {
  const itemList = Object.values(cartItems);
  const totalQuantity = itemList.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = itemList.reduce(
    (sum, item) => sum + Number(item.totalAmount.amount),
    0
  );
  const currencyCode = cartItems[0]?.totalAmount.currencyCode ?? "CAD";
  return {
    totalQuantity,
    cost: {
      subtotalAmount: {
        amount: totalAmount.toString(),
        currencyCode,
      },
      totalAmount: {
        amount: totalAmount.toString(),
        currencyCode,
      },
      totalTaxAmount: {
        amount: "0", // TODO - Add real taxes
        currencyCode,
      },
    },
  };
};
