"use client";

import { ProductOption, ProductVariant } from "@/lib/shopify/types";
import { useProduct, useUpdateURL } from "../../contexts/product-context";
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


const VariantSelector: React.FC<VariantSelectorProps> = ({ option, options, variants }) => {
  const { state, updateOption } = useProduct();
  const updateURL = useUpdateURL();

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

  const optionNameLowerCase = option.name.toLowerCase();


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
        className="w-full px-4 py-2 rounded-lg border bg-white"
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

const Variants: React.FC<VariantsProps> = ({ options, variants }) => {
  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values.length === 1);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

  return options.map(option => {
    if (option.name === "Frame") return null;
    return <VariantSelector key={option.id} option={option} options={options} variants={variants} />
  })
}

export default Variants;