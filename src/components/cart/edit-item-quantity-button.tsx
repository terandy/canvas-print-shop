import { CartItem } from "@/lib/shopify/types";
import clsx from "clsx";
import { updateCartItem } from "@/lib/utils/cart-actions";
import { useActionState } from "react";
import { UpdateQuantityType } from "@/contexts/cart-context";
import { Minus, Plus } from "lucide-react";

interface SubmitButtonProps {
  type: "plus" | "minus";
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  type
}) => {
  return <button type="submit" aria-label={type === "plus" ? "Increase item quantity" : "Reduce item quantity"} className={clsx("ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80", {
    "ml-auto": type === "minus"
  })}>
    {type === "plus" ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
  </button>;
};

interface EditItemQttyProps {
  item: CartItem;
  type: "plus" | "minus";
  optimisticUpdate: (cartItemId: string, updateType: UpdateQuantityType) => void;
}

const EditItemQuantityButton: React.FC<EditItemQttyProps> = ({
  item,
  type,
  optimisticUpdate
}) => {
  const [message, formAction] = useActionState(updateCartItem, null);
  const payload = {
    cartItemId: item.id,
    merchandiseId: item.merchandise.id,
    quantity: type === "plus" ? item.quantity + 1 : item.quantity - 1,
    attributes: item.attributes
  };
  return <form action={async () => {
    optimisticUpdate(payload.cartItemId, type);
    await formAction(payload);
  }}>
    <SubmitButton type={type} />
    <p aria-label="polite" className="sr-only" role="status">
      {message}
    </p>
  </form>;
};

export default EditItemQuantityButton;