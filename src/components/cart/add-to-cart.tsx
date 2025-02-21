"use client";

import React, { useActionState } from "react";

import { Product, ProductVariant } from "@/lib/shopify/types";
import { useProduct, useCart } from "@/contexts";
import * as api from "../../lib/utils/cart-actions";
import { useRouter } from "next/navigation";
import { deleteImage } from "@/lib/s3/actions/image";
import { Plus, X } from "lucide-react";
import Button from "../buttons/button";

interface AddToCardProps {
  product: Product;
}
const AddToCart: React.FC<AddToCardProps> = ({ product }) => {
  const { variants } = product;
  const { addOptimisticCartItem } = useCart();
  const { state } = useProduct();
  const router = useRouter();

  const [message, addCartItem] = useActionState(api.addItem, null);
  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId
  )!;

  const onCancel: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (state.imgURL) deleteImage(state.imgURL);
    router.replace("/");
  };

  return (
    <form
      action={async () => {
        addOptimisticCartItem(
          finalVariant,
          product,
          state.imgURL,
          state.borderStyle,
          state.direction
        ); // optimistic
        await addCartItem({
          selectedVariantId,
          imgURL: state.imgURL,
          borderStyle: state.borderStyle,
          direction: state.direction,
        });
        router.replace("/");
      }}
      className="flex flex-col gap-2"
    >
      <Button
        disabledMessage={"Please select an option"}
        icon={Plus}
        type="submit"
        className="bg-secondary hover:bg-primary-light"
        disabled={!selectedVariantId || !state.imgURL}
      >
        Add To Cart
      </Button>
      <Button onClick={onCancel} icon={X} variant="ghost">
        Cancel
      </Button>
      <p className="sr-only" role="status" aria-label="polite">
        {message}
      </p>
    </form>
  );
};

export default AddToCart;
