/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { createContext, useCallback, useContext, useMemo, useOptimistic } from "react";
export type ProductState = {
  [key: string]: string;
} & {
  /**
   * Currently displayed image in the gallery
   */
  image?: string;
  /**
   * The ID of the cart item
   */
  merchandiseId?: string;
};
type ProductContextType = {
  state: ProductState;
  updateOption: (name: string, value: string) => ProductState;
  updateImage: (index: string) => ProductState;
  deleteOption: (name: string) => ProductState;
  updateOptions: (update: ProductState) => ProductState;
};
const ProductContext = createContext<ProductContextType | undefined>(undefined);
export const ProductProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const getInitialState = () => {
    const params: ProductState = {};
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params;
  };
  const [state, setOptimisticState] = useOptimistic(getInitialState(), (prevState: ProductState, update: ProductState) => ({
    ...prevState,
    ...update
  }));
  const updateOption = (name: string, value: string) => {
    const newState = {
      [name]: value
    };
    setOptimisticState(newState);
    return {
      ...state,
      ...newState
    };
  };

  const updateOptions = (update: ProductState) => {
    setOptimisticState(update);
    return { ...state, ...update }

  }

  const deleteOption = (name: string) => {
    const newState = {
      ...state
    };
    delete newState[name]
    setOptimisticState(newState);
    return newState;
  };

  const updateImage = (index: string) => {
    const newState = {
      image: index
    };
    setOptimisticState(newState);
    return {
      ...state,
      ...newState
    };
  };
  const value = useMemo(() => ({
    state,
    updateOption,
    deleteOption,
    updateImage,
    updateOptions,
  }), [state]);
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}
export function useUpdateURL() {
  const router = useRouter();
  return useCallback((state: ProductState) => {
    const newParams = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    router.push(`?${newParams.toString()}`, {
      scroll: false
    });
  }, [router]);
}