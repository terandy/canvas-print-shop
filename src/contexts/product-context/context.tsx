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
import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";
import { getInitialFormState } from "./utils";

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
  const { handle } = product;
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, setState] = useState<FormState>(getInitialFormState(handle));
  const [imgFileUrl, setImgFileUrl] = useState<string | null>(null);

  const updateState = (update: FormState) => {
    setState((prevState) => ({
      ...prevState,
      ...update,
    }));
  };

  const updateField = <U extends keyof FormState>(
    name: U,
    value: FormState[U]
  ): FormState => {
    const newState = { ...state, [name]: value };

    updateState(newState);
    return newState;
  };

  const deleteImgURL = () => {
    const update = { imgURL: DEFAULT_CANVAS_IMAGE };
    updateState(update);
    return update;
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
      cartItemID,
      handle,
      imgFileUrl,
      product,
      state,
      variant,
      deleteImgURL,
      setImgFileUrl,
      updateField,
      updateState,
    }),
    [state, variant, imgFileUrl, handle, product, cartItemID]
  );

  useEffect(() => {
    try {
      // Load saved state after hydration
      const savedState = localStorage.getItem(handle);
      const savedCartItemID = localStorage.getItem("cartItemID");
      if (!savedState) {
        setIsHydrated(true);
        setState(getInitialFormState(handle));
        return;
      }
      const parsedSavedState = JSON.parse(savedState);
      if (savedCartItemID === cartItemID) {
        setState({ ...state, ...parsedSavedState });
      } else {
        setState(getInitialFormState(handle));
      }
    } catch (error) {
      console.error("Failed to parse saved state:", error);
    } finally {
      setIsHydrated(true);
    }
  }, [handle, cartItemID]);

  useEffect(() => {
    // Only save state after hydration and when state changes
    if (isHydrated) {
      localStorage.setItem(handle, JSON.stringify(state));
    }
  }, [state, handle, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (cartItemID) {
      localStorage.setItem("cartItemID", cartItemID);
    } else {
      localStorage.removeItem("cartItemID");
    }
  }, [cartItemID, handle, isHydrated]);

  return (
    <ProductContext.Provider key={product.handle + cartItemID} value={value}>
      {children}
    </ProductContext.Provider>
  );
};

const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined)
    throw new Error("useProduct must be used within a Canvas Provider");
  return context;
};

export { useProduct, ProductProvider };
