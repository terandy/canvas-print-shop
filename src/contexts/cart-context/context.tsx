"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
} from "react";
import type {
  CartState,
  TCartContext,
  CartItem,
  CanvasCartItem,
} from "./types";
import { Cart, ProductVariant } from "@/lib/shopify/types";
import {
  generateNewCanvasCartItem,
  generateUpdatedCanvasCartItem,
  getInitialState,
  generateCartTotals,
  generateUpdatedCartItemQuantity,
} from "./utils";
import { FormState } from "../product-context";

const CartContext = createContext<TCartContext | undefined>(undefined);

const CartProvider = ({
  children,
  cart,
}: {
  children: React.ReactNode;
  cart: Cart | undefined;
}) => {
  const [state, setOptimisticState] = useOptimistic(
    getInitialState(cart),
    (prevState: CartState, update: Partial<CartState>) => ({
      ...prevState,
      ...update,
    })
  );
  const addCanvasCartItem = (formState: FormState, variant: ProductVariant) => {
    const newCartItem = generateNewCanvasCartItem(formState, variant);
    const newItems = { ...state.items, [newCartItem.id]: newCartItem };
    return {
      ...state,
      ...generateCartTotals(newItems),
      items: newItems,
    };
  };
  const updateCanvasCartItem = (
    cartItemID: CanvasCartItem["id"],
    updates: Partial<FormState>,
    variant: ProductVariant
  ) => {
    const cartItem = state.items[cartItemID];
    if (cartItem.title !== "Canvas") {
      console.warn("cartItem found is not a canvas");
    }
    const newCartItem = generateUpdatedCanvasCartItem(
      cartItem as CanvasCartItem,
      updates,
      variant
    );
    const newItems = { ...state.items };
    newItems[cartItemID] = newCartItem;
    return {
      ...state,
      ...generateCartTotals(newItems),
      items: newItems,
    };
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
    return {
      ...state,
      ...generateCartTotals(newItems),
      items: newItems,
    };
  };

  const setState = (newState: Cart) => {
    setOptimisticState(newState);
    return newState;
  };

  const value = useMemo<TCartContext>(
    () => ({
      state,
      addCanvasCartItem,
      updateCanvasCartItem,
      updateCartItemQuantity,
      setState,
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined)
    throw new Error("useCart must be used within a Cart Provider");
  return context;
};

export { useCart, CartProvider };
