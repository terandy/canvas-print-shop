"use-client";

import { useProduct } from "@/contexts";
import clsx from "clsx";
import { useTranslations } from "next-intl";

const DirectionSelector = () => {
  const { state, updateField } = useProduct();
  const t = useTranslations("Product.direction");

  const options = [
    { label: t("landscape"), value: "landscape", className: "w-24 h-16" },
    { label: t("portrait"), value: "portrait", className: "h-24 w-16" },
  ];
  return (
    <form>
      <dl className="mb-8">
        <dt className="mb-4 text-sm uppercase tracking-wide">{t("title")}</dt>
        <dd className="flex gap-3 items-center">
          {options.map((option) => {
            const isActive =
              state.direction?.toLowerCase() === option.value?.toLowerCase();

            return (
              <button
                formAction={() => {
                  updateField("direction", option.value);
                }}
                key={option.label}
                title={`${option.label}`}
                className={clsx(
                  "flex items-center justify-center rounded border bg-background p-1 text-xs",
                  {
                    "cursor-default ring-2 ring-primary-light": isActive,
                    "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-primary-light":
                      !isActive,
                  },
                  option.className
                )}
              >
                {option.label}
              </button>
            );
          })}
        </dd>
      </dl>
    </form>
  );
};

export default DirectionSelector;
