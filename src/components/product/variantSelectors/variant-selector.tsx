"use client";

import { useProduct, FormState } from "@/contexts";
import { ProductOption, ProductVariant } from "@/lib/shopify/types";
import { useTranslations } from "next-intl";
import { startTransition } from "react";

type Combination = {
  id: string;
  price: string;
  currencyCode: string;
  [key: string]: string | boolean;
};

interface VariantSelectorProps {
  option: ProductOption;
  options: ProductOption[];
  variants: ProductVariant[];
}

interface VariantsProps {
  options: ProductOption[];
  variants: ProductVariant[];
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  option,
  options,
  variants,
}) => {
  const { state, updateField } = useProduct();
  const t = useTranslations("Product");

  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    price: variant.price.amount,
    currencyCode: variant.price.currencyCode,
    ...variant.selectedOptions.reduce(
      (accumulator, option) => ({
        ...accumulator,
        [option.name.toLowerCase()]: option.value,
      }),
      {}
    ),
  }));

  const key = option.name.toLowerCase() as keyof FormState;

  return (
    <form key={option.id} className="mb-8">
      <label
        htmlFor={option.name}
        className="block mb-4 text-sm uppercase tracking-wide"
      >
        {t(`${option.name}.title`)}
      </label>
      <select
        id={option.name}
        value={state[key] ?? undefined}
        onChange={(e) => {
          startTransition(() => {
            updateField(key, e.target.value);
          });
        }}
        className="w-full px-4 py-2 rounded-lg border bg-white"
      >
        <option value="">{t(`${option.name}.select`)}</option>
        {option.values.map((value) => {
          const optionParams = { ...state, [key]: value };
          const filtered = Object.entries(optionParams).filter(([key, value]) =>
            options.find(
              (option) => option.name === key && option.values.includes(value)
            )
          );

          const variantMatch = combinations.find((combination) =>
            filtered.every(([key, value]) => combination[key] === value)
          );

          const formattedPrice = variantMatch?.price
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: variantMatch.currencyCode,
              }).format(Number(variantMatch.price))
            : "";

          return (
            <option key={value} value={value}>
              {value} {formattedPrice ? `- ${formattedPrice}` : ""}
            </option>
          );
        })}
      </select>
    </form>
  );
};

export default VariantSelector;
