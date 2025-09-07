"use-client";

import { useProduct } from "@/contexts";
import { BASE_STATE } from "@/contexts/product-context/data";
import { ProductOption, ProductVariant } from "@/lib/shopify/types";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Price from "../price";

type Combination = {
  id: string;
  price: string;
  currencyCode: string;
  [key: string]: string | boolean;
};

interface Props {
  option: ProductOption;
  options: ProductOption[];
  variants: ProductVariant[];
}

const FrameSelector: React.FC<Props> = ({ option, options, variants }) => {
  const { state, updateField } = useProduct();
  const t = useTranslations("Product");

  const getImageOptions = (opt: string) => {
    switch (opt) {
      case "black":
        return "/frame/black-frame.png";
      case "none":
      default:
        return "/frame/no-frame.jpeg";
    }
  };

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

  return (
    <form>
      <dl className="mb-8">
        <dt className="mb-4 text-sm uppercase tracking-wide">
          {t(`${option.name}.title`)}
        </dt>
        <dd className="flex flex-wrap gap-3">
          {option.values.map((value) => {
            const isActive = state.frame?.toLowerCase() === value.toLowerCase();
            const optionParams = {
              ...BASE_STATE,
              size: state.size,
              [option.name]: value,
            };

            const filtered = Object.entries(optionParams).filter(
              ([key, value]) =>
                options.find(
                  (option) =>
                    option.name === key && option.values.includes(value)
                )
            );

            const noneMatch = combinations.find(
              (combination) =>
                combination.size === state.size &&
                combination.frame === BASE_STATE.frame &&
                combination.depth === BASE_STATE.depth
            );

            const variantMatch = combinations.find((combination) =>
              filtered.every(([key, value]) => combination[key] === value)
            );

            // This is the difference in price between the "no option" option, and the currently selected option.
            const price = variantMatch?.price
              ? Number(variantMatch.price) - Number(noneMatch?.price)
              : "";

            return (
              <button
                formAction={() => {
                  updateField("frame", value.toLowerCase());
                }}
                key={value}
                title={t(`frame.${value}`)}
                className={clsx("border rounded bg-white", {
                  "cursor-default ring-2 ring-primary-light": isActive,
                  "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-primary-light":
                    !isActive,
                })}
              >
                <Image
                  className="object-cover h-[100px]"
                  alt={`preview-${value}`}
                  src={getImageOptions(value.toLowerCase())}
                  height={100}
                  width={100}
                />
                <div className="flex flex-col">
                  <span className="text-sm">{t(`frame.${value}`)}</span>
                  <span className="text-xs text-gray-800">
                    <Price currencyCode="CAD" amount={`${price}`} />
                  </span>
                </div>
              </button>
            );
          })}
        </dd>
      </dl>
    </form>
  );
};

export default FrameSelector;
