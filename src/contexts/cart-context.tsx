"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { Cart, CartItem, Product, ProductVariant } from "@/lib/shopify/types";
import { createContext, useContext, useMemo, useOptimistic } from "react";
import { v4 } from "uuid";
export type UpdateQuantityType = "plus" | "minus" | "delete";
type CartContextType = {
  cart: Cart | undefined;
  updateOptimisticCartItemQuantity: (
    cartItemId: string,
    updateType: UpdateQuantityType
  ) => void;
  updateOptimisticCartItem: (
    cartItemId: string,
    variant: ProductVariant,
    product: Product,
    imgURL: string,
    borderStyle: string,
    direction: string
  ) => void;
  addOptimisticCartItem: (
    variant: ProductVariant,
    product: Product,
    imgURL: string,
    borderStyle: string,
    direction: string
  ) => void;
};
type CartAction =
  | {
      type: "UPDATE_ITEM_QUANTITY";
      payload: {
        cartItemId: string;
        updateType: UpdateQuantityType;
      };
    }
  | {
      type: "ADD_ITEM";
      payload: {
        variant: ProductVariant;
        product: Product;
        imgURL: string;
        borderStyle: string;
        direction: string;
      };
    }
  | {
      type: "UPDATE_ITEM";
      payload: {
        cartItemId: string;
        variant: ProductVariant;
        product: Product;
        imgURL: string;
        borderStyle: string;
        direction: string;
      };
    };

const createEmptyCart = (): Cart => {
  return {
    id: undefined,
    checkoutUrl: "",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: {
        amount: "0",
        currencyCode: "USD",
      },
      totalAmount: {
        amount: "0",
        currencyCode: "USD",
      },
      totalTaxAmount: {
        amount: "0",
        currencyCode: "USD",
      },
    },
  };
};
const calculateItemCost = (quantity: number, price: string): string => {
  return (Number(price) * quantity).toString();
};

const updateCartItemQuantity = (
  item: CartItem,
  updateType: UpdateQuantityType
): CartItem | null => {
  if (updateType === "delete") return null;
  const newQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;
  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString()
  );
  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
      },
    },
  };
};
const updateCartTotals = (
  lines: CartItem[]
): Pick<Cart, "totalQuantity" | "cost"> => {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "USD";
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
        amount: "0",
        currencyCode,
      },
    },
  };
};
const createCartItem = (
  variant: ProductVariant,
  product: Product,
  imgURL: string,
  borderStyle: string,
  direction: string
): CartItem => {
  const quantity = 1;
  const totalAmount = calculateItemCost(quantity, variant.price.amount);
  return {
    id: v4(), // temporary id
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
    attributes: [
      {
        key: "_IMAGE URL",
        value: imgURL,
      },
      {
        key: "borderStyle",
        value: borderStyle,
      },
      {
        key: "direction",
        value: direction,
      },
    ],
  };
};
const updateCartItem = (
  existingItem: CartItem,
  variant: ProductVariant,
  product: Product,
  imgURL: string,
  borderStyle: string,
  direction: string
): CartItem => {
  const quantity = 1;
  const totalAmount = calculateItemCost(quantity, variant.price.amount);
  return {
    id: existingItem.id,
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
    attributes: [
      {
        key: "_IMAGE URL",
        value: imgURL,
      },
      {
        key: "borderStyle",
        value: borderStyle,
      },
      {
        key: "direction",
        value: direction,
      },
    ],
  };
};

const cartReducer = (state: Cart | undefined, action: CartAction): Cart => {
  const currentCart = state || createEmptyCart();
  switch (action.type) {
    case "UPDATE_ITEM": {
      const { cartItemId, variant, product, imgURL, borderStyle, direction } =
        action.payload;
      const existingItem = currentCart.lines.find(
        (item) => item.id === cartItemId
      );
      if (!existingItem) throw Error("cart item not found");
      const updatedItem = updateCartItem(
        existingItem,
        variant,
        product,
        imgURL,
        borderStyle,
        direction
      );
      const updatedLines = existingItem
        ? currentCart.lines.map((item) =>
            item.id === cartItemId ? updatedItem : item
          )
        : [...currentCart.lines, updatedItem];
      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "UPDATE_ITEM_QUANTITY": {
      const { cartItemId, updateType } = action.payload;
      const updatedLines = currentCart.lines
        .map((item) =>
          item.id === cartItemId
            ? updateCartItemQuantity(item, updateType)
            : item
        )
        .filter(Boolean) as CartItem[];
      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: {
              ...currentCart.cost.totalAmount,
              amount: "0",
            },
          },
        };
      }
      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "ADD_ITEM": {
      const { variant, product, imgURL, borderStyle, direction } =
        action.payload;
      const updatedItem = createCartItem(
        variant,
        product,
        imgURL,
        borderStyle,
        direction
      );
      const updatedLines = [...currentCart.lines, updatedItem];
      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    default:
      return currentCart;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CartProvider = ({
  children,
  cart,
}: {
  children: React.ReactNode;
  cart: Cart | undefined;
}) => {
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    cart,
    cartReducer
  );
  const updateOptimisticCartItemQuantity = (
    cartItemId: string,
    updateType: UpdateQuantityType
  ) => {
    updateOptimisticCart({
      type: "UPDATE_ITEM_QUANTITY",
      payload: {
        cartItemId,
        updateType,
      },
    });
  };
  const updateOptimisticCartItem = (
    cartItemId: string,
    variant: ProductVariant,
    product: Product,
    imgURL: string,
    borderStyle: string,
    direction: string
  ) => {
    updateOptimisticCart({
      type: "UPDATE_ITEM",
      payload: {
        cartItemId,
        variant,
        product,
        imgURL,
        borderStyle,
        direction,
      },
    });
  };
  const addOptimisticCartItem = (
    variant: ProductVariant,
    product: Product,
    imgURL: string,
    borderStyle: string,
    direction: string
  ) => {
    updateOptimisticCart({
      type: "ADD_ITEM",
      payload: {
        variant,
        product,
        imgURL,
        borderStyle,
        direction,
      },
    });
  };
  const value = useMemo(
    () => ({
      cart: optimisticCart,
      updateOptimisticCartItemQuantity,
      updateOptimisticCartItem,
      addOptimisticCartItem,
    }),
    [optimisticCart]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export { CartProvider, useCart };
