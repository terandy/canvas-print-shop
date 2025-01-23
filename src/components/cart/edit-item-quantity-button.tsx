import { CartItem } from "@/lib/shopify/types";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { updateItemQuantity } from "@/lib/utils/cart-actions";
import { useActionState } from "react";

interface SubmitButtonProps {
  type: "plus" | "minus";
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  type
}) => {
  return <button type="submit" aria-label={type === "plus" ? "Increase item quantity" : "Reduce item quantity"} className={clsx("ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80", {
    "ml-auto": type === "minus"
  })}>
    {type === "plus" ? <PlusIcon className="h-4 w-4 dark:text-neutral-500" /> : <MinusIcon className="h-4 w-4 dark:text-neutral-500" />}
  </button>;
};

interface EditItemQttyProps {
  item: CartItem;
  type: "plus" | "minus";
  optimisticUpdate: any;
}

const EditItemQuantityButton: React.FC<EditItemQttyProps> = ({
  item,
  type,
  optimisticUpdate
}) => {
  const [message, formAction] = useActionState(updateItemQuantity, null);
  const payload = {
    merchandiseId: item.merchandise.id,
    quantity: type === "plus" ? item.quantity + 1 : item.quantity - 1,
    attributes: item.attributes
  };
  return <form action={async () => {
    optimisticUpdate(payload.merchandiseId, type);
    await formAction(payload);
  }}>
    <SubmitButton type={type} />
    <p aria-label="polite" className="sr-only" role="status">
      {message}
    </p>
  </form>;
};

export default EditItemQuantityButton;