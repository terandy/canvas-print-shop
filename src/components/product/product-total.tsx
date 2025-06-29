"use client";

import { useProduct } from "@/contexts";
import Price from "./price";
import { useTranslations } from "next-intl";

const ProductTotal = () => {
  const t = useTranslations("price");
  const { variant } = useProduct();

  return (
    <div className="flex gap-1">
      <span className="mb-4 text-sm uppercase tracking-wide">{t("total")}</span>
      <Price
        currencyCode={variant.price.currencyCode}
        amount={`${variant.price.amount}`}
      />
    </div>
  );
};

export default ProductTotal;
