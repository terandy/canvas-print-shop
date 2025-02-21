"use client";

import { Product, ProductVariant } from "@/lib/shopify/types";
import { useProduct, useCart } from "@/contexts";
import * as api from "@/lib/utils/cart-actions";
import React, { useActionState } from "react";
import { Plus, Save } from "lucide-react";
import Button from "../buttons/button";
import ButtonLink from "../buttons/button-link";

interface SubmitButtonProps {
  saved?: boolean;
  disabled: boolean;
}
const SubmitButton: React.FC<SubmitButtonProps> = ({ saved, disabled }) => {
  return (
    <Button
      aria-label={saved ? "Please select an option" : "Add to cart"}
      disabled={disabled || saved}
      icon={Save}
    >
      {!saved ? "Save changes" : "Saved"}
    </Button>
  );
};

interface SaveCartItemProps {
  product: Product;
  cartItemID: string;
}
const SaveCartItem: React.FC<SaveCartItemProps> = ({ product, cartItemID }) => {
  const { variants } = product;
  const { updateOptimisticCartItem, cart } = useCart();
  const { state } = useProduct();
  const [message, updateCartItem] = useActionState(api.updateCartItem, null);
  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  console.log(variants);
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId
  )!;
  const prevCartItem = cart?.lines.find((line) => line.id === cartItemID);

  const imgURL = prevCartItem?.attributes.find(
    (attr) => attr.key === "_IMAGE URL"
  )?.value;
  const borderStyle = prevCartItem?.attributes?.find(
    (attr) => attr.key === "borderStyle"
  )?.value;
  const direction = prevCartItem?.attributes?.find(
    (attr) => attr.key === "direction"
  )?.value;

  const hasDiff =
    prevCartItem?.merchandise.id !== selectedVariantId ||
    imgURL !== state.imgURL ||
    borderStyle !== state.borderStyle ||
    direction !== state.direction;

  return (
    <form
      action={async () => {
        if (!selectedVariantId) return;
        updateOptimisticCartItem(
          cartItemID,
          finalVariant,
          product,
          state.imgURL,
          state.borderStyle,
          state.direction
        ); // optimistic
        await updateCartItem({
          cartItemId: cartItemID,
          merchandiseId: selectedVariantId,
          quantity: 1,
          attributes: [
            { key: "_IMAGE URL", value: state.imgURL },
            { key: "borderStyle", value: state.borderStyle },
            { key: "direction", value: state.direction },
          ],
        });
      }}
      className="flex flex-col gap-2"
    >
      <SubmitButton
        saved={!hasDiff}
        disabled={!state.imgURL || !selectedVariantId}
      />
      <ButtonLink
        href={`/product/${product.handle}`}
        variant="secondary"
        icon={Plus}
        iconPosition="left"
      >
        Create a new canvas
      </ButtonLink>
      <p className="sr-only" role="status" aria-label="polite">
        {message}
      </p>
    </form>
  );
};

export default SaveCartItem;
