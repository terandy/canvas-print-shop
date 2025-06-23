"use client";

import { useProduct, FormState } from "@/contexts";
import { BASE_STATE } from "@/contexts/product-context/data";
import { ProductOption, ProductVariant } from "@/lib/shopify/types";
import { useTranslations } from "next-intl";
import { startTransition } from "react";
import Price from "../price";

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

const VariantSelector: React.FC<VariantSelectorProps> = ({
  option,
  options,
  variants,
}) => {
  const { state, updateField } = useProduct();
  const t = useTranslations("Product");
  const priceTr = useTranslations("price");

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
        {t(`${key}.title`)}
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
          const optionParams = {
            ...BASE_STATE,
            size: state.size,
            [option.name]: value,
          };

          const filtered = Object.entries(optionParams).filter(([key, value]) =>
            options.find(
              (option) => option.name === key && option.values.includes(value)
            )
          );

          const noneMatch = combinations.find(
            (combination) =>
              combination.size === optionParams.size &&
              combination.frame === BASE_STATE.frame &&
              combination.depth === BASE_STATE.depth
          );

          const variantMatch = combinations.find((combination) =>
            filtered.every(([key, value]) => combination[key] === value)
          );

          // This is the difference in price between the "no option" option, and the currently selected option.
          const price: number =
            variantMatch && noneMatch
              ? Number(variantMatch.price) - Number(noneMatch.price)
              : 0;

          return (
            <option key={value} value={value}>
              <span>{t(`${option.name}.${value}`)}</span>
              {price !== 0 && (
                <div>
                  {" - "}
                  <Price
                    currencyCode={"CAD"}
                    amount={`${price < 0 ? price * -1 : price}`}
                  />
                  {price < 0 && ` ${priceTr("discount")}`}
                </div>
              )}
            </option>
          );
        })}
      </select>
    </form>
  );
};

export default VariantSelector;
