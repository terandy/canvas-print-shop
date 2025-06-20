"use-client";

import { useProduct } from "@/contexts";
import { ProductOption, ProductVariant } from "@/lib/shopify/types";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import Image from "next/image";

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
              ...state,
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
                combination.size === optionParams.size &&
                combination.frame === "none"
            );

            const variantMatch = combinations.find((combination) =>
              filtered.every(([key, value]) => combination[key] === value)
            );
            const formattedPrice = variantMatch?.price
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: variantMatch.currencyCode,
                }).format(Number(variantMatch.price) - Number(noneMatch?.price))
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
                    {formattedPrice}
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
