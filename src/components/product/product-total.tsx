"use client";

import { useProduct } from "@/contexts";
import Price from "./price";
import { useTranslations } from "next-intl";

const ProductTotal = ({ appearance }: { appearance?: "editorial" } = {}) => {
  const t = useTranslations("price");
  const productT = useTranslations("Product");
  const { variant } = useProduct();

  if (!variant) {
    return (
      <p role="status" className="mb-4 text-sm text-red-700">
        {productT("selectionUnavailable")}
      </p>
    );
  }

  return (
    <div
      className={
        appearance === "editorial"
          ? "mb-5 flex items-center justify-between gap-4"
          : "flex gap-1"
      }
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className={
          appearance === "editorial"
            ? "text-[11px] font-medium uppercase tracking-[0.15em]"
            : "mb-4 text-sm uppercase tracking-wide"
        }
      >
        {t("total")}
      </span>
      <span
        className={
          appearance === "editorial"
            ? "font-serif text-4xl tracking-[-0.035em]"
            : undefined
        }
      >
        <Price
          currencyCode={variant.price.currencyCode}
          amount={`${variant.price.amount}`}
        />
      </span>
    </div>
  );
};

export default ProductTotal;
