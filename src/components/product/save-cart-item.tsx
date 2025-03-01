"use client";

import { ProductVariant } from "@/lib/shopify/types";
import { useCart, FormState, useProduct } from "@/contexts";
import * as api from "@/lib/utils/cart-actions";
import React, { useActionState } from "react";
import { Plus, Save } from "lucide-react";
import Button from "../buttons/button";
import { getAttributes, toProductState } from "@/contexts/cart-context/utils";
import { CartItem } from "@/contexts/cart-context/types";
import { ButtonLink } from "../buttons";

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

interface SaveCartItemProps<T extends FormState> {
  cartItemID: string;
}

const SaveCartItem = <T extends FormState, U extends CartItem>({
  cartItemID,
}: SaveCartItemProps<T>) => {
  const cartContext = useCart();
  const {
    product: { handle },
    state,
    variant,
  } = useProduct();
  const [message, updateCartItem] = useActionState(api.updateCartItem, null);
  const prevCartItem = cartContext.state?.items[cartItemID] as U;

  const hasDiff =
    JSON.stringify(state) !==
    JSON.stringify(prevCartItem ? toProductState(prevCartItem) : null);

  return (
    <form
      action={async () => {
        if (!state.imgURL || !variant) return;
        cartContext.updateCartItem(cartItemID, state, variant); // optimistic
        await updateCartItem({
          cartItemId: cartItemID,
          merchandiseId: variant.id,
          quantity: 1,
          attributes: getAttributes(state),
        });
      }}
      className="flex flex-col gap-2"
    >
      <SubmitButton saved={!hasDiff} disabled={!state.imgURL} />
      <ButtonLink
        href={`/product/${handle}`}
        variant="secondary"
        icon={Plus}
        iconPosition="left"
        onClick={() => {
          localStorage.removeItem(handle);
          localStorage.removeItem("cartItemID");
        }}
        replace
      >
        Create a new {handle}
      </ButtonLink>
      <p className="sr-only" role="status" aria-label="polite">
        {message}
      </p>
    </form>
  );
};

export default SaveCartItem;
