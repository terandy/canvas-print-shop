"use client";

import { useCart, useProduct } from "@/contexts";
import * as api from "@/lib/utils/cart-actions";
import React, { useActionState } from "react";
import { Plus, Save } from "lucide-react";
import Button from "../buttons/button";
import { getAttributes, toProductState } from "@/contexts/cart-context/utils";
import { ButtonLink } from "../buttons";
import { useLocale, useTranslations } from "next-intl";

interface SubmitButtonProps {
  saved?: boolean;
  disabled: boolean;
  loading?: boolean;
}
const SubmitButton: React.FC<SubmitButtonProps> = ({
  saved,
  disabled,
  loading,
}) => {
  const t = useTranslations("Cart.SaveItem");
  const label = !saved ? t("saveChanges") : t("saved");
  return (
    <Button
      aria-label={label}
      disabled={disabled || saved || loading}
      icon={Save}
      loading={loading}
    >
      {label}
    </Button>
  );
};

interface SaveCartItemProps {
  cartItemID: string;
}

const SaveCartItem = ({ cartItemID }: SaveCartItemProps) => {
  const { state: cartState, updateCartItem: contextUpdateCartItem } = useCart();
  const {
    product: { handle },
    state,
    variant,
  } = useProduct();
  const t = useTranslations("Cart.SaveItem");
  const locale = useLocale();

  const [message, updateCartItem] = useActionState(api.updateCartItem, null);

  const checkDiff = () => {
    const prevCartItem = cartState?.items[cartItemID];
    const prevState = prevCartItem ? toProductState(prevCartItem) : null;

    return !Object.keys(state).every((key) => {
      return state[key] === prevState?.[key];
    });
  };

  const hasDiff = checkDiff();

  return (
    <form
      action={async () => {
        if (!state.imgURL || !variant || !cartItemID) return;
        contextUpdateCartItem(cartItemID, state, variant); // optimistic
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
        href={`/${locale}/product/${handle}`}
        variant="secondary"
        icon={Plus}
        iconPosition="left"
        onClick={() => {
          localStorage.removeItem(handle);
          localStorage.removeItem("cartItemID");
        }}
        replace
      >
        {t("createNew")}
      </ButtonLink>
      <p className="sr-only" role="status" aria-label="polite">
        {message}
      </p>
    </form>
  );
};

export default SaveCartItem;
