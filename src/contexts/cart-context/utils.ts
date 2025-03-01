import { Attribute, Cart, LineItem, ProductVariant } from "@/lib/shopify/types";
import { CartState, CartItem } from "./types";
import { FormState } from "../product-context";
import { v4 } from "uuid";
import { EMPTY_CART_STATE } from "./data";

const getCartItem = (lineItem: LineItem): CartItem => {
  return {
    title: lineItem.merchandise.product.handle,
    imgURL:
      lineItem.attributes.find((value) => {
        return value.key === "imgURL";
      })?.value ?? lineItem.merchandise.product.featuredImage.url,
    id: lineItem.id,
    quantity: lineItem.quantity,
    totalAmount: lineItem.cost.totalAmount,
    variantID: lineItem.merchandise.id,
    attributes: lineItem.attributes,
    selectedOptions: lineItem.merchandise.selectedOptions,
  } as CartItem;
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
  return Object.entries(formState)
    .map(([key, value]) => ({ name: key, value }))
    .filter((item) => isSelectOption(item.name));
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
  cartItem.selectedOptions.forEach((opt) => (interim[opt.name] = opt.value));
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
  const prevSelectedOptions = Object.fromEntries(
    prevItem.selectedOptions.map((attr) => [attr.name, attr.value])
  );
  return {
    ...prevItem,
    totalAmount: productVariant.price,
    attributes: getAttributes({ ...prevAttributes, ...updates }),
    selectedOptions: getSelectOptions({ ...prevSelectedOptions, ...updates }),
    imgURL: prevAttributes.imgURL,
  };
};

export const generateUpdatedCartItemQuantity = (
  prevItem: CartItem,
  action: "plus" | "minus" | "delete"
): CartItem | null => {
  let quantity = prevItem.quantity;
  const price = Number(prevItem.totalAmount) / quantity;
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

export const getInitialState = (cart?: Cart): CartState => {
  if (!cart) return { ...EMPTY_CART_STATE };
  const items: CartState["items"] = {};
  cart.lines.forEach((line) => {
    const cartItemID = line.id;
    items[cartItemID] = getCartItem(line);
  });
  return {
    id: cart.id,
    totalQuantity: cart.totalQuantity,
    cost: cart.cost,
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
  const currencyCode = cartItems[0]?.totalAmount.currencyCode ?? "USD";
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
