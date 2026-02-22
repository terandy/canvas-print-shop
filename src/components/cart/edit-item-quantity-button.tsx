"use client";

import { updateCartItem } from "@/lib/utils/cart-actions";
import { useActionState } from "react";
import { Minus, Plus } from "lucide-react";
import Button from "../buttons/button";
import { CartItem, TCartContext } from "@/contexts/cart-context/types";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { deleteImage } from "@/lib/s3/actions/image";

interface SubmitButtonProps {
  type: "plus" | "minus";
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ type }) => {
  const t = useTranslations("Cart.Quantity");

  return (
    <Button
      type="submit"
      aria-label={type === "plus" ? t("increase") : t("decrease")}
      icon={type === "plus" ? Plus : Minus}
      size="sm"
      variant="ghost"
    />
  );
};

interface EditItemQttyProps {
  item: CartItem;
  type: "plus" | "minus";
  optimisticUpdate: TCartContext["updateCartItemQuantity"];
}

const EditItemQuantityButton: React.FC<EditItemQttyProps> = ({
  item,
  type,
  optimisticUpdate,
}) => {
  const [message, formAction] = useActionState(updateCartItem, null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const payload = {
    cartItemId: item.id,
    merchandiseId: item.variantID,
    quantity: type === "plus" ? item.quantity + 1 : item.quantity - 1,
    attributes: item.attributes,
  };
  return (
    <form
      action={async () => {
        optimisticUpdate(item.id, type);
        if (type === "minus" && item.quantity === 1) {
          if (searchParams.get("cartItemID") === item.id)
            router.replace(pathname);
        }
        await formAction(payload);
        if (type === "minus" && item.quantity === 1) {
          if (item.imgURL) await deleteImage(item.imgURL);
        }
      }}
    >
      <SubmitButton type={type} />
      <p aria-label="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
};

export default EditItemQuantityButton;
