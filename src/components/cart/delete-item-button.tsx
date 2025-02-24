"use client";

import { removeItem } from "@/lib/utils/cart-actions";
import { useActionState } from "react";
import { deleteImage } from "@/lib/s3/actions/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import Button from "../buttons/button";
import { CartItem, TCartContext } from "@/contexts";

interface Props {
  item: CartItem;
  optimisticUpdate: TCartContext["updateCartItemQuantity"];
}

const DeleteItemButton: React.FC<Props> = ({ item, optimisticUpdate }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, formAction] = useActionState(removeItem, null);
  const cartItemId = item.id;
  return (
    <form
      action={async () => {
        optimisticUpdate(cartItemId, "delete");
        await formAction(cartItemId);
        const imgUrl = item.imgURL;
        if (imgUrl) deleteImage(imgUrl);
        if (searchParams.get("cartItemID") === cartItemId) router.replace("/");
      }}
    >
      <Button
        type="submit"
        aria-label="Remove cart item"
        icon={Trash}
        variant="ghost"
        className="border border-transparent hover:text-red-600"
        size="sm"
      />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
};

export default DeleteItemButton;
