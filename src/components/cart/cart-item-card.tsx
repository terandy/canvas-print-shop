import { CartItem, TCartContext } from "@/contexts";
import { toProductState } from "@/contexts/cart-context/utils";
import Image from "next/image";
import DeleteItemButton from "./delete-item-button";
import EditItemQuantityButton from "./edit-item-quantity-button";
import Price from "../product/price";
import EditItemButton from "./edit-item-button";
import { useTranslations } from "next-intl";

interface Props {
  item: CartItem;
  closeCart: () => void;
  updateCartItemQuantity: TCartContext["updateCartItemQuantity"];
}

const CartItemCard: React.FC<Props> = ({
  item,
  updateCartItemQuantity,
  closeCart,
}) => {
  const state = toProductState(item);
  const t = useTranslations("Product");

  const getTitle = () => {
    return t(item.title);
  };

  return (
    <li className="border-b border-gray-light/10 py-4">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-light/20 bg-background">
          <Image
            src={item.imgURL}
            width={80}
            height={80}
            alt="Custom Print"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1">
          <div className="space-y-1">
            <p className="text-secondary font-medium capitalize">
              {getTitle()}
            </p>
            {Object.entries(state)
              .filter(
                ([key, _value]) => key !== "imgURL" && key !== "cartItemID"
              )
              .map(([key, value]) => (
                <span
                  key={key}
                  className="block text-sm text-gray first-letter:capitalize"
                >
                  {key === "size" ? value : t(`${key}.${value}`)}
                </span>
              ))}
          </div>
        </div>
        <div className="flex">
          <DeleteItemButton
            item={item}
            optimisticUpdate={updateCartItemQuantity}
          />
          <EditItemButton item={item} closeCart={closeCart} />
        </div>
      </div>
      <div className="flex mt-4 items-center justify-between gap-4">
        <div className="flex items-center rounded-full border border-gray-light/20">
          <EditItemQuantityButton
            item={item}
            type="minus"
            optimisticUpdate={updateCartItemQuantity}
          />
          <p className="w-8 text-center text-secondary">{item.quantity}</p>
          <EditItemQuantityButton
            item={item}
            type="plus"
            optimisticUpdate={updateCartItemQuantity}
          />
        </div>
        <Price
          className="text-secondary font-medium"
          amount={item.totalAmount.amount}
          currencyCode={item.totalAmount.currencyCode}
        />
      </div>
    </li>
  );
};

export default CartItemCard;
