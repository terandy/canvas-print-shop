"use client";

import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { TProductContext, FormState } from "./types";
import { Product } from "@/lib/shopify/types";
import { INITIAL_FORM_STATE } from "./data";
import { LOCAL_STORAGE_FORM_STATE } from "@/lib/constants";

const ProductContext = createContext<TProductContext | undefined>(undefined);

const ProductProvider = ({
  children,
  product,
  cartItemID,
}: {
  children: React.ReactNode;
  product: Product;
  cartItemID: string | null;
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, setState] = useState(INITIAL_FORM_STATE);

  const updateState = (update: Partial<FormState>) => {
    setState((prevState) => ({
      ...prevState,
      ...update,
    }));
  };
  useEffect(() => {
    try {
      // Load saved state after hydration
      const savedState = localStorage.getItem(LOCAL_STORAGE_FORM_STATE);
      if (!savedState) return;
      const parsedSavedState = JSON.parse(savedState);
      if (
        typeof parsedSavedState === "object" &&
        parsedSavedState.cartItemID === cartItemID
      ) {
        setState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error("Failed to parse saved state:", error);
    }
    setIsHydrated(true);

    // Return cleanup function to handle component unmounting
    return () => {
      // Cancel any pending transitions
      startTransition(() => {});
    };
  }, [isHydrated]);

  useEffect(() => {
    // Only save state after hydration and when state changes
    if (isHydrated) {
      localStorage.setItem(LOCAL_STORAGE_FORM_STATE, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const updateField = <T extends keyof FormState>(
    name: T,
    value: FormState[T]
  ) => {
    const newState = { ...state, [name]: value };

    updateState(newState);
    return newState;
  };

  const deleteImgURL = () => {
    const update = { imgURL: "default-image.jpeg" } as Partial<FormState>;
    updateState(update);
    return { ...state, ...update };
  };

  const variant = useMemo(() => {
    return (
      product.variants.find((variant) => {
        variant.selectedOptions.every((option) => {
          return state[option.name as keyof FormState] === option.value;
        });
      }) ?? product.variants[0]
    );
  }, [state, product.variants]);

  const value = useMemo<TProductContext>(
    () => ({
      state,
      variant,
      updateField,
      updateState,
      deleteImgURL,
    }),
    [state, variant]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined)
    throw new Error("useProduct must be used within a Canvas Provider");
  return context;
};

export { useProduct, ProductProvider };
