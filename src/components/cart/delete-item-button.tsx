"use client";

import { CartItem } from "@/lib/shopify/types";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { removeItem } from "@/lib/utils/cart-actions";
import { useActionState } from "react";

interface Props {
  item: CartItem;
  optimisticUpdate: any;
}

const DeleteItemButton: React.FC<Props> = ({
  item,
  optimisticUpdate
}) => {
  const [message, formAction] = useActionState(removeItem, null);
  const merchandiseId = item.merchandise.id;
  return <form action={async () => {
    optimisticUpdate(merchandiseId, "delete");
    await formAction(merchandiseId);
  }}>
    <button type="submit" aria-label="Remove cart item" className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-neutral-500">
      <XMarkIcon className="mx-[1px] h-4 w-4 text-white dark:text-black" />
    </button>
    <p aria-live="polite" className="sr-only" role="status">
      {message}
    </p>
  </form>;
};

export default DeleteItemButton;