"use client";

import { ProductVariant } from "@/lib/shopify/types";
import { useCart, FormState } from "@/contexts";
import * as api from "@/lib/utils/cart-actions";
import React, { useActionState } from "react";
import { Plus, Save } from "lucide-react";
import Button from "../buttons/button";
import { toProductState } from "@/contexts/cart-context/utils";
import { CanvasCartItem } from "@/contexts/cart-context/types";
import { ButtonLink } from "../buttons";
import { LOCAL_STORAGE_FORM_STATE } from "@/lib/constants";

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
  variant: ProductVariant;
  formState: FormState;
  cartItemID: string;
}
const SaveCartItem: React.FC<SaveCartItemProps> = ({
  cartItemID,
  variant,
  formState,
}) => {
  const cartContext = useCart();
  const [message, updateCartItem] = useActionState(api.updateCartItem, null);
  const prevCartItem = cartContext.state?.items[cartItemID] as CanvasCartItem;

  const hasDiff =
    JSON.stringify(formState) !==
    JSON.stringify(prevCartItem ? toProductState(prevCartItem) : null);

  return (
    <form
      action={async () => {
        if (!formState.imgURL || !variant || !formState.cartItemID) return;
        cartContext.updateCanvasCartItem(prevCartItem.id, formState, variant); // optimistic
        await updateCartItem({
          cartItemId: prevCartItem.id,
          merchandiseId: variant.id,
          quantity: 1,
          attributes: [
            { key: "imgURL", value: formState.imgURL },
            { key: "borderStyle", value: formState.borderStyle },
            { key: "direction", value: formState.direction },
          ],
        });
      }}
      className="flex flex-col gap-2"
    >
      <SubmitButton saved={!hasDiff} disabled={!formState.imgURL} />
      <ButtonLink
        href={`/product/${prevCartItem.title}`}
        variant="secondary"
        icon={Plus}
        iconPosition="left"
        onClick={() => localStorage.removeItem(LOCAL_STORAGE_FORM_STATE)}
        replace
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
