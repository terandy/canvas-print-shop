"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import type { CartState, TCartContext, CartItem } from "./types";
import type { ProductVariant } from "@/types/product";
import type { Cart } from "@/types/cart";
import {
  generateNewCartItem,
  generateUpdatedCartItem,
  getInitialState,
  generateCartTotals,
  generateUpdatedCartItemQuantity,
} from "./utils";
import { FormState } from "../product-context";
import { createCartAndSetCookie, removeItem } from "@/lib/utils/cart-actions";
import { checkImageExists } from "@/lib/s3/actions/image";

const CartContext = createContext<TCartContext | undefined>(undefined);

const CartProvider = ({
  children,
  cart,
}: {
  children: React.ReactNode;
  cart: Cart | undefined;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [state, setOptimisticState] = useOptimistic(
    getInitialState(cart),
    (prevState: CartState, update: Partial<CartState>) => ({
      ...prevState,
      ...update,
    })
  );
  const addCartItem = (
    formState: FormState,
    variant: ProductVariant,
    productHandle: string
  ) => {
    const newCartItem = generateNewCartItem(formState, variant, productHandle);
    const newItems = { ...state.items, [newCartItem.id]: newCartItem };
    const update = {
      ...state,
      ...generateCartTotals(newItems),
      items: newItems,
    };
    setOptimisticState(update);
    return update;
  };
  const updateCartItem = (
    cartItemID: CartItem["id"],
    updates: FormState,
    variant: ProductVariant
  ) => {
    const cartItem = state.items[cartItemID];
    const newCartItem = generateUpdatedCartItem(cartItem, updates, variant);
    const newItems = { ...state.items };
    newItems[cartItemID] = newCartItem;
    const update = {
      ...state,
      ...generateCartTotals(newItems),
      items: newItems,
    };
    setOptimisticState(update);
    return update;
  };

  const updateCartItemQuantity = (
    cartItemID: CartItem["id"],
    action: "plus" | "minus" | "delete"
  ) => {
    const newCartItem = generateUpdatedCartItemQuantity(
      state.items[cartItemID],
      action
    );
    const newItems = { ...state.items };
    if (newCartItem) {
      newItems[cartItemID] = newCartItem;
    } else {
      delete newItems[cartItemID];
    }
    const update = {
      ...state,
      ...generateCartTotals(newItems),
      items: newItems,
    };
    setOptimisticState(update);
    return update;
  };

  const [, startTransition] = useTransition();

  const clearCart = () => {
    startTransition(() => {
      setOptimisticState({
        id: state.id,
        cost: {
          subtotalAmount: { amount: "0", currencyCode: "CAD" },
          totalAmount: { amount: "0", currencyCode: "CAD" },
          totalTaxAmount: { amount: "0", currencyCode: "CAD" },
        },
        totalQuantity: 0,
        items: {},
      });
    });
  };

  const value = useMemo<TCartContext>(
    () => ({
      state,
      addCartItem,
      updateCartItem,
      updateCartItemQuantity,
      clearCart,
      isOpen,
      setIsOpen,
    }),
    [state, isOpen]
  );
  useEffect(() => {
    if (!state.id) {
      createCartAndSetCookie();
    }
  }, [state.id]);

  // Remove cart items whose S3 image no longer exists
  useEffect(() => {
    const items = Object.values(state.items);
    items.forEach((item) => {
      if (!item.imgURL) return;
      checkImageExists(item.imgURL).then((exists) => {
        if (!exists) {
          startTransition(async () => {
            updateCartItemQuantity(item.id, "delete");
            await removeItem({}, item.id);
          });
        }
      });
    });
  }, []);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined)
    throw new Error("useCart must be used within a Cart Provider");
  return context;
};

export { useCart, CartProvider };
