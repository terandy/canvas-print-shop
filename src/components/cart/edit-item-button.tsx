import { toProductState } from "@/contexts/cart-context/utils";
import { ButtonLink } from "../buttons";
import { Pencil } from "lucide-react";
import { CartItem } from "@/contexts";

interface Props {
  item: CartItem;
  closeCart: () => void;
}

const EditItemButton: React.FC<Props> = ({ item, closeCart }) => {
  const getProductHref = () => {
    const newParams = new URLSearchParams();
    newParams.set("cartItemID", item.id);
    return `/product/${item.title}?${newParams.toString()}`;
  };
  return (
    <ButtonLink
      href={getProductHref()}
      onClick={() => {
        localStorage.setItem(item.title, JSON.stringify(toProductState(item)));
        localStorage.setItem("cartItemID", item.id);
        closeCart();
      }}
      icon={Pencil}
      size="sm"
      title="Edit"
      variant="secondary"
      replace
    >
      Edit
    </ButtonLink>
  );
};

export default EditItemButton;
