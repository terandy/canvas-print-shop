"use client";

import { ProductOption, ProductVariant } from "@/lib/shopify/types";
import { useProduct, useUpdateURL } from "../../contexts/product-context";
import clsx from "clsx";
import { startTransition } from "react";

type Combination = {
  id: string;
  price: string;
  currencyCode: string;
  [key: string]: string | boolean;
};

interface Props {
  options: ProductOption[];
  variants: ProductVariant[];
}

const VariantSelector: React.FC<Props> = ({ options, variants }) => {
  const { state, updateOption } = useProduct();
  const updateURL = useUpdateURL();

  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values.length === 1);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

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

  return options.map((option) => {
    const optionNameLowerCase = option.name.toLowerCase();
    const isSelect = ["size", "frame"].includes(optionNameLowerCase);

    if (isSelect) {
      return (
        <form key={option.id} className="mb-8">
          <label
            htmlFor={option.name}
            className="block mb-4 text-sm uppercase tracking-wide"
          >
            {option.name}
          </label>
          <select
            id={option.name}
            value={state[optionNameLowerCase] || ""}
            onChange={(e) => {
              startTransition(() => {
                const newState = updateOption(optionNameLowerCase, e.target.value);
                updateURL(newState);
              }
              )
            }}
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-neutral-900 dark:border-neutral-800"
          >
            <option value="">Select {option.name}</option>
            {option.values.map((value) => {
              const optionParams = { ...state, [optionNameLowerCase]: value };
              const filtered = Object.entries(optionParams).filter(
                ([key, value]) =>
                  options.find(
                    (option) =>
                      option.name.toLowerCase() === key &&
                      value !== null && option.values.includes(value)
                  )
              );

              const variantMatch = combinations.find((combination) =>
                filtered.every(
                  ([key, value]) => combination[key] === value
                )
              );

              const formattedPrice = variantMatch?.price ?
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: variantMatch.currencyCode
                }).format(Number(variantMatch.price)) :
                '';

              return (
                <option
                  key={value}
                  value={value}
                >
                  {value} {formattedPrice ? `- ${formattedPrice}` : ''}
                </option>
              );
            })}
          </select>
        </form >
      );
    }

    return (
      <form key={option.id}>
        <dl className="mb-8">
          <dt className="mb-4 text-sm uppercase tracking-wide">{option.name}</dt>
          <dd className="flex flex-wrap gap-3">
            {option.values.map((value) => {
              const isActive = state[optionNameLowerCase] === value;

              return (
                <button
                  formAction={() => {
                    const newState = updateOption(optionNameLowerCase, value);
                    updateURL(newState);
                  }}
                  key={value}
                  title={`${option.name} ${value}`}
                  className={clsx(
                    "flex min-w-[48px] items-center justify-center rounded-full border bg-neutral-100 px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900",
                    {
                      "cursor-default ring-2 ring-blue-600": isActive,
                      "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600":
                        !isActive,
                    }
                  )}
                >
                  {value}
                </button>
              );
            })}
          </dd>
        </dl>
      </form>
    );
  });
}

export default VariantSelector;