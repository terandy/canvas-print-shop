"use client";

import { toProductState } from "@/contexts/cart-context/utils";
import { ButtonLink } from "../buttons";
import { Pencil } from "lucide-react";
import { CartItem } from "@/contexts";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface Props {
  item: CartItem;
  closeCart: () => void;
}

const EditItemButton: React.FC<Props> = ({ item, closeCart }) => {
  const t = useTranslations("Cart.EditItem");
  const locale = useLocale();

  const getProductHref = () => {
    const newParams = new URLSearchParams();
    newParams.set("cartItemID", item.id);
    return `/${locale}/product/${item.title}?${newParams.toString()}`;
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
      title={t("title")}
      variant="secondary"
      replace
    >
      {t("label")}
    </ButtonLink>
  );
};

export default EditItemButton;
