"use client";
import { FormState, useProduct } from "@/contexts";
import clsx from "clsx";
import { useTranslations } from "use-intl";
import { useState, useEffect, startTransition } from "react";
import { InfoIcon } from "lucide-react";
import { ProductOption, ProductVariant } from "@/lib/shopify/types";

const INCHES_TO_CM = 2.54; // Conversion factor: 1 inch = 2.54 cm
const MIN_DPI = 100; // Minimum DPI for good print quality

type Combination = {
  id: string;
  price: string;
  currencyCode: string;
  [key: string]: string | boolean;
};

// Define types for the component
interface SizeOption {
  width: number;
  height: number;
  value: string;
  price: number;
}

interface SizeSelectorProps {
  option: ProductOption;
  options: ProductOption[];
  variants: ProductVariant[];
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  options,
  option,
  variants,
}) => {
  const { state, updateField } = useProduct();
  const t = useTranslations("Product.size");
  const tr = useTranslations("Product");

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

  const [imageResolution, setImageResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Convert inches to centimeters and round to 1 decimal place
  const inchesToCm = (inches: number): string => {
    return (inches * INCHES_TO_CM).toFixed(1);
  };

  const checkImageCompatibility = (width: number, height: number) => {
    if (!imageResolution) return tr("noImage");
    // Calculate DPI for both dimensions
    const widthDPI = imageResolution.width / width;
    const heightDPI = imageResolution.height / height;

    // Get the minimum DPI (the limiting factor)
    const effectiveDPI = Math.min(widthDPI, heightDPI);

    if (effectiveDPI >= MIN_DPI) {
      return <span className="text-gray-500">{t("quality.goodQuality")}</span>;
    } else if (effectiveDPI >= MIN_DPI * 0.7) {
      return (
        <span className="flex gap-1 text-gray-500">
          {t("quality.normalQuality")}
        </span>
      );
    }
    return (
      <span
        className="flex gap-1 text-gray-500"
        title={t("quality.poorDescription")}
      >
        {t("quality.lowQuality")} <InfoIcon />
      </span>
    );
  };

  useEffect(() => {
    if (state.imgURL) {
      const img = new Image();
      img.src = state.imgURL;
      img.onload = () => {
        setImageResolution({ width: img.width, height: img.height });
      };
    }
  }, [state.imgURL]);

  return (
    <div>
      <h3 className="block mb-4 text-sm uppercase tracking-wide">
        {t(`title`)}
      </h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">{t("width")}</th>
            <th className="p-2 text-left">{t("height")}</th>
            <th className="p-2 text-left">{t("price")}</th>
            <th className="p-2 text-left">{t("quality.title")}</th>
          </tr>
        </thead>
        <tbody>
          {option.values.map((value) => {
            const optionParams = { ...state, [key]: value };
            const isActive = state[key] === value;
            const filtered = Object.entries(optionParams).filter(
              ([key, value]) =>
                options.find(
                  (option) =>
                    option.name === key && option.values.includes(value)
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

            const [x, y] = value.split("x");
            return (
              <tr
                key={value}
                className={clsx(
                  "cursor-pointer border-b transition duration-300 ease-in-out",
                  {
                    "ring-2 ring-primary-light": isActive,
                    "hover:bg-gray-100": !isActive,
                  }
                )}
                onClick={() =>
                  startTransition(() => {
                    updateField(key, value);
                  })
                }
              >
                <td className="p-2">
                  {x}
                  <span className="text-gray-400 text-sm ml-1">
                    ({inchesToCm(+x)} cm)
                  </span>
                </td>
                <td className="p-2">
                  {y}
                  <span className="text-gray-400 text-sm ml-1">
                    ({inchesToCm(+y)} cm)
                  </span>
                </td>
                <td className="p-2">{formattedPrice}</td>
                <td className="p-2">{checkImageCompatibility(+x, +y)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SizeSelector;
