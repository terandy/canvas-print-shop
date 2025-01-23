"use client";

import { Product, ProductVariant } from "@/lib/shopify/types";
import { useProduct } from "../../contexts/product-context";
import { useCart } from "../../contexts/cart-context";
import clsx from "clsx";
import * as api from "../../lib/utils/cart-actions";
import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useActionState } from "react";

interface SubmitButtonProps {
  availableForSale: boolean;
  disabled?: boolean;
}
const SubmitButton: React.FC<SubmitButtonProps> = ({
  availableForSale,
  disabled
}) => {
  const buttonClasses = "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";
  if (!availableForSale) {
    return <button disabled className={clsx(buttonClasses, disabledClasses)}>
      Out of Stock
    </button>;
  }
  if (disabled) {
    return <button aria-label="Please select an option" disabled className={clsx(buttonClasses, disabledClasses)}>
      <div className="absolute left-0 ml-4">
        +
      </div>
      Add to Cart
    </button>;
  }
  return <button aria-label="Add to cart" className={clsx(buttonClasses, {
    "hover:opacity-90": true
  })}>
    <div className="absolute left-0 ml-4">
      <PlusIcon />
    </div>
    Add To Cart
  </button>;
};

interface AddToCardProps {
  product: Product;

}
export const AddToCart: React.FC<AddToCardProps> = ({
  product,
}) => {
  const {
    variants,
    availableForSale,
  } = product;
  const { addOptimisticCartItem } = useCart();
  const { state } = useProduct();
  const [message, addCartItem] = useActionState(api.addItem, null);
  const variant = variants.find((variant: ProductVariant) => variant.selectedOptions.every(option => option.value === state[option.name.toLowerCase()]));
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find(variant => variant.id === selectedVariantId)!;

  return <form action={async () => {
    addOptimisticCartItem(finalVariant, product, state.imgURL); // optimistic
    await addCartItem({ selectedVariantId, imgURL: state.imgURL });
  }}>
    <SubmitButton availableForSale={availableForSale} disabled={!selectedVariantId || !state.imgURL} />
    <p className="sr-only" role="status" aria-label="polite">
      {message}
    </p>
  </form>;
};