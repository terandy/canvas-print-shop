import { CartItem, TCartContext } from "@/contexts";
import { toProductState } from "@/contexts/cart-context/utils";
import Image from "next/image";
import DeleteItemButton from "./delete-item-button";
import EditItemQuantityButton from "./edit-item-quantity-button";
import Price from "../product/price";
import EditItemButton from "./edit-item-button";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

// Constants
const IMAGE_SIZE = {
  width: 80,
  height: 80,
} as const;

interface Props {
  item: CartItem;
  closeCart: () => void;
  updateCartItemQuantity: TCartContext["updateCartItemQuantity"];
}

// Product Details Component
interface ProductDetailsProps {
  state: Record<string, any>;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ state }) => {
  const t = useTranslations("Product");

  const filteredStateEntries = useMemo(
    () =>
      Object.entries(state).filter(
        ([key]) => key !== "imgURL" && key !== "cartItemID"
      ),
    [state]
  );

  return (
    <div className="space-y-1">
      {filteredStateEntries.map(([key, value]) => (
        <div key={key} className="flex gap-2 items-start gap-2">
          <span className="text-sm font-medium text-gray flex-shrink-0">
            {t(`${key}.title`)}:
          </span>
          <span className="text-sm text-gray-800 first-letter:capitalize">
            {key === "size" ? value : t(`${key}.${value}`)}
          </span>
        </div>
      ))}
    </div>
  );
};

const CartItemCard: React.FC<Props> = ({
  item,
  updateCartItemQuantity,
  closeCart,
}) => {
  const state = toProductState(item);
  const t = useTranslations("Product");

  return (
    <li className="border-b border-gray-light/10 py-4">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-light/20 bg-background">
          <Image
            src={item.imgURL}
            width={IMAGE_SIZE.width}
            height={IMAGE_SIZE.height}
            alt={t(item.title) || "Product image"}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1">
          <div className="space-y-1">
            <p className="text-secondary font-medium capitalize">
              {t(item.title)}
            </p>
            <ProductDetails state={state} />
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
        <p className="text-secondary font-medium">
          <Price
            amount={item.totalAmount.amount}
            currencyCode={item.totalAmount.currencyCode}
          />
        </p>
      </div>
    </li>
  );
};

export default CartItemCard;
