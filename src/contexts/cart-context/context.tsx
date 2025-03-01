"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
} from "react";
import type { CartState, TCartContext, CartItem } from "./types";
import { Cart, ProductVariant } from "@/lib/shopify/types";
import {
  generateNewCartItem,
  generateUpdatedCartItem,
  getInitialState,
  generateCartTotals,
  generateUpdatedCartItemQuantity,
} from "./utils";
import { FormState } from "../product-context";
import { createCartAndSetCookie } from "@/lib/utils/cart-actions";

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

  const setState = (newState: Cart) => {
    setOptimisticState(newState);
    return newState;
  };

  const value = useMemo<TCartContext>(
    () => ({
      state,
      addCartItem,
      updateCartItem,
      updateCartItemQuantity,
      setState,
    }),
    [state]
  );
  useEffect(() => {
    if (!state.id) {
      createCartAndSetCookie();
    }
  }, [state.id]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined)
    throw new Error("useCart must be used within a Cart Provider");
  return context;
};

export { useCart, CartProvider };
