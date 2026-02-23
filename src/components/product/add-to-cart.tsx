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
import { getInitialFormState } from "@/contexts/product-context/utils";
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
    updateState,
    setImgFileUrl,
  } = useProduct();
  const router = useRouter();

  const onCancel: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (state.imgURL !== DEFAULT_CANVAS_IMAGE) {
      deleteImage(state.imgURL);
    }
    updateState(getInitialFormState(handle));
    setImgFileUrl(null);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!variant) return;
    startTransition(async () => {
      cartContext.addCartItem({ ...state }, variant, handle); // optimistic
      const res = await api.addItem(
        {},
        {
          selectedVariantId: variant.id,
          attributes: getAttributes(state),
        }
      );

      // Find the cart item by matching the image URL
      const cartItem =
        typeof res === "object" &&
        "items" in res &&
        res.items.find(
          (item: { attributes?: { imageUrl?: string } }) =>
            item.attributes?.imageUrl === state.imgURL
        );

      if (cartItem) {
        localStorage.setItem("cartItemID", cartItem.id);
        router.push(`?cartItemID=${cartItem.id}`);
        cartContext.setIsOpen(true);
      }
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
