"use client";

import { CartItem } from "@/lib/shopify/types";
import { removeItem } from "@/lib/utils/cart-actions";
import { useActionState } from "react";
import { deleteImage } from "@/lib/s3/actions/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import Button from "../buttons/button";

interface Props {
  item: CartItem;
  optimisticUpdate: any;
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
        const imgUrl = item.attributes.find(
          (attr) => attr.key === "_IMAGE URL"
        )?.value;
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
