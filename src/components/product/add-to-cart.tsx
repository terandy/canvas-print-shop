"use client";

import React, { startTransition } from "react";

import { useCart, useProduct } from "@/contexts";
import * as api from "../../lib/utils/cart-actions";
import { useRouter } from "next/navigation";
import { deleteImage } from "@/lib/s3/actions/image";
import { Plus, X } from "lucide-react";
import Button from "../buttons/button";
import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";
import { getAttributes } from "@/contexts/cart-context/utils";
import { useTranslations } from "next-intl";

/**
 * Find the variant that matches the form selections (as stored in the useProduct context
 */
const AddToCart: React.FC = () => {
  const cartContext = useCart();
  const t = useTranslations("Cart");
  const {
    product: { handle },
    state,
    variant,
  } = useProduct();
  const router = useRouter();

  const onCancel: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (state.imgURL !== DEFAULT_CANVAS_IMAGE) deleteImage(state.imgURL);
    router.replace("/");
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (state.imgURL === DEFAULT_CANVAS_IMAGE || !variant) return;
    startTransition(async () => {
      cartContext.addCartItem({ ...state }, variant, handle); // optimistic
      const res = await api.addItem(
        {},
        {
          selectedVariantId: variant.id,
          attributes: getAttributes(state),
        }
      );
      if (typeof res === "object" && res.id)
        router.push(`?cartItemID=${res.id}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Button
        disabledMessage={t("AddToCart.disabledMessage")}
        icon={Plus}
        type="submit"
        className="bg-secondary hover:bg-primary-light"
        disabled={state.imgURL === DEFAULT_CANVAS_IMAGE || !variant}
      >
        {t("AddToCart.label")}
      </Button>
      <Button onClick={onCancel} icon={X} variant="ghost">
        {t("AddToCart.cancel")}
      </Button>
    </form>
  );
};

export default AddToCart;
