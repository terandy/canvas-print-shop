"use client";

import React, { useActionState } from "react";

import { useProduct, useCart, FormState } from "@/contexts";
import * as api from "../../lib/utils/cart-actions";
import { useRouter } from "next/navigation";
import { deleteImage } from "@/lib/s3/actions/image";
import { Plus, X } from "lucide-react";
import Button from "../buttons/button";
import { ProductVariant } from "@/lib/shopify/types";
import { v4 } from "uuid";
import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";

interface AddToCardProps {
  variant: ProductVariant;
  formState: FormState;
}

/**
 * Find the variant that matches the form selections (as stored in the useProduct context
 */
const AddToCart: React.FC<AddToCardProps> = ({ variant, formState }) => {
  const cartContext = useCart();
  const router = useRouter();

  const [message, addCartItem] = useActionState(api.addItem, null);

  const onCancel: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (formState.imgURL !== DEFAULT_CANVAS_IMAGE)
      deleteImage(formState.imgURL);
    router.replace("/");
  };

  return (
    <form
      action={async () => {
        if (formState.imgURL === DEFAULT_CANVAS_IMAGE || !variant) return;
        cartContext.addCanvasCartItem({ ...formState }, variant); // optimistic
        await addCartItem({
          selectedVariantId: variant.id,
          imgURL: formState.imgURL,
          borderStyle: formState.borderStyle,
          direction: formState.direction,
        });
      }}
      className="flex flex-col gap-2"
    >
      <Button
        disabledMessage={"Please select an option"}
        icon={Plus}
        type="submit"
        className="bg-secondary hover:bg-primary-light"
        disabled={formState.imgURL === DEFAULT_CANVAS_IMAGE || !variant}
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
