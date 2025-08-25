"use-client";

import { useProduct } from "@/contexts";
import clsx from "clsx";
import Image from "next/image";
import { useTranslations } from "use-intl";

const BorderStyleSelector = () => {
  const { state, updateField } = useProduct();
  const t = useTranslations("Product.borderStyle");

  const options = [
    {
      label: t("wrapped"),
      value: "wrapped",
      src: "/border/wrapped-border.png",
    },
    { label: t("fill"), value: "fill", src: "/border/fill-border.png" },
  ];

  return (
    <form>
      <dl className="mb-8">
        <dt className="mb-4 text-sm uppercase tracking-wide">{t("title")}</dt>
        <dd className="flex flex-wrap gap-3">
          {options.map((option) => {
            const isActive = state.borderStyle === option.value;

            return (
              <button
                formAction={() => {
                  updateField("borderStyle", option.value);
                }}
                key={option.label}
                title={`${option.label}`}
                className={clsx("border rounded bg-background", {
                  "cursor-default ring-2 ring-primary-light": isActive,
                  "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-primary-light":
                    !isActive,
                })}
              >
                <Image
                  alt={`preview-${option.label}`}
                  src={option.src}
                  height={100}
                  width={100}
                />
                <span className="text-sm">{option.label}</span>
              </button>
            );
          })}
        </dd>
      </dl>
    </form>
  );
};

export default BorderStyleSelector;
