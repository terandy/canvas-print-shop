"use client";

import { Product, ProductVariant } from "@/lib/shopify/types";
import { useProduct } from "../../contexts/product-context";
import { useCart } from "../../contexts/cart-context";
import clsx from "clsx";
import * as api from "../../lib/utils/cart-actions";
import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useActionState } from "react";

interface SubmitButtonProps {
  saved?: boolean;
  disabled: boolean;
}
const SubmitButton: React.FC<SubmitButtonProps> = ({
  saved,
  disabled,
}) => {
  const buttonClasses = "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "opacity-60 hover:opacity-60";

  const className = clsx(buttonClasses, !saved && !disabled &&
    "hover:opacity-90",
    (disabled || saved) && disabledClasses
  )

  return <button aria-label={saved ? "Please select an option" : "Add to cart"} className={className}>
    <div className="absolute left-0 ml-4">
      <PlusIcon />
    </div>
    {!saved ? "Save changes" : "Saved"}
  </button>;
};

interface SaveCartItemProps {
  product: Product;
  cartItemID: string;

}
export const SaveCartItem: React.FC<SaveCartItemProps> = ({
  product,
  cartItemID
}) => {
  const {
    variants,
  } = product;
  const { updateOptimisticCartItem, cart } = useCart();
  const { state } = useProduct();
  const [message, updateCartItem] = useActionState(api.updateCartItem, null);
  const variant = variants.find((variant: ProductVariant) => variant.selectedOptions.every(option => option.value === state[option.name.toLowerCase()]));
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find(variant => variant.id === selectedVariantId)!;
  const prevCartItem = cart?.lines.find(line => line.id === cartItemID)

  const imgURL = prevCartItem?.attributes.find(attr => attr.key === "_IMAGE URL")?.value

  const hasDiff = prevCartItem?.merchandise.id !== selectedVariantId || imgURL !== state.imgURL

  return <form action={async () => {
    if (!selectedVariantId) return;
    updateOptimisticCartItem(cartItemID, finalVariant, product, state.imgURL); // optimistic
    await updateCartItem({ cartItemId: cartItemID, merchandiseId: selectedVariantId, quantity: 1, attributes: [{ key: "_IMAGE URL", value: state.imgURL }] });
  }}>
    <SubmitButton saved={!hasDiff} disabled={!state.imgURL || !selectedVariantId} />
    <p className="sr-only" role="status" aria-label="polite">
      {message}
    </p>
  </form>;
};