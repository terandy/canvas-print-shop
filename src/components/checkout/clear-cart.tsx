"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/contexts";
import { clearCartAction } from "@/lib/utils/cart-actions";

export default function ClearCart() {
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    if (!hasCleared.current) {
      hasCleared.current = true;
      // Clear both the UI state and the database
      clearCart();
      clearCartAction();
    }
  }, [clearCart]);

  return null;
}
