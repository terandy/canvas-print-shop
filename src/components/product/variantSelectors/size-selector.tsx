"use client";
import { FormState, useProduct } from "@/contexts";
import clsx from "clsx";
import { useTranslations } from "use-intl";
import { useState, useEffect, startTransition } from "react";
import { InfoIcon } from "lucide-react";
import { ProductOption, ProductVariant } from "@/lib/shopify/types";
import { BASE_STATE } from "@/contexts/product-context/data";
import Price from "../price";

const INCHES_TO_CM = 2.54; // Conversion factor: 1 inch = 2.54 cm
const MIN_DPI = 100; // Minimum DPI for good print quality

type Combination = {
  id: string;
  price: string;
  currencyCode: string;
  [key: string]: string | boolean;
};

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

  // State for responsive design
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
        {t("quality.lowQuality")} <InfoIcon size={16} />
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

  // Mobile card view for each size option
  const renderMobileSizeCards = () => {
    return (
      <div className="space-y-3">
        {option.values.map((value) => {
          const isActive = state[key] === value;
          const optionParams = {
            ...BASE_STATE,
            size: value,
          };

          const productOption = Object.entries(optionParams).filter(
            ([key, value]) =>
              options.find(
                (option) => option.name === key && option.values.includes(value)
              )
          );

          const variantMatch = combinations.find((combination) =>
            productOption.every(([key, value]) => combination[key] === value)
          );

          // This is the difference in price between the "no option" option, and the currently selected option.
          const price = variantMatch?.price ? Number(variantMatch.price) : "";

          const [x, y] = value.split("x");

          return (
            <div
              key={value}
              className={clsx(
                "p-3 border rounded-md cursor-pointer transition duration-300 ease-in-out",
                {
                  "ring-2 ring-primary-light bg-gray-50": isActive,
                  "hover:bg-gray-50": !isActive,
                }
              )}
              onClick={() =>
                startTransition(() => {
                  updateField(key, value);
                })
              }
            >
              <div>
                <div className="font-medium">
                  {x}&quot; × {y}&quot;
                  <span className="text-gray-400 text-xs ml-1">
                    ({inchesToCm(+x)} × {inchesToCm(+y)} cm)
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="mt-1 text-sm">
                  {<Price currencyCode={"CAD"} amount={`${price}`} />}
                </div>
                <div className="text-sm">{checkImageCompatibility(+x, +y)}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Desktop table view
  const renderDesktopTable = () => {
    return (
      <div className="overflow-x-auto">
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
              const isActive = state[key] === value;
              const optionParams = {
                ...BASE_STATE,
                size: value,
              };

              const productOption = Object.entries(optionParams).filter(
                ([key, value]) =>
                  options.find(
                    (option) =>
                      option.name === key && option.values.includes(value)
                  )
              );

              const variantMatch = combinations.find((combination) =>
                productOption.every(
                  ([key, value]) => combination[key] === value
                )
              );

              // This is the difference in price between the "no option" option, and the currently selected option.
              const price = variantMatch?.price
                ? Number(variantMatch.price)
                : "";

              const [x, y] = value.split("x");

              return (
                <tr
                  key={value}
                  className={clsx(
                    "cursor-pointer transition duration-300 ease-in-out",
                    {
                      "border border-primary": isActive,
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
                    {x}&quot;
                    <span className="text-gray-400 text-xs ml-1">
                      ({inchesToCm(+x)} cm)
                    </span>
                  </td>
                  <td className="p-2">
                    {y}&quot;
                    <span className="text-gray-400 text-xs ml-1">
                      ({inchesToCm(+y)} cm)
                    </span>
                  </td>
                  <td className="p-2">
                    {<Price currencyCode={"CAD"} amount={`${price}`} />}
                  </td>
                  <td className="p-2">{checkImageCompatibility(+x, +y)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h3 className="block mb-4 text-sm uppercase tracking-wide">
        {t(`title`)}
      </h3>
      {isMobile ? renderMobileSizeCards() : renderDesktopTable()}
    </div>
  );
};

export default SizeSelector;
