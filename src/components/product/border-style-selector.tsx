"use-client";

import { useProduct, useUpdateURL } from "@/contexts";
import clsx from "clsx";
import Image from "next/image";

const BorderStyleSelector = () => {
  const { state, updateOption } = useProduct();
  const updateURL = useUpdateURL();
  const options = [
    { label: "Black", value: "black", src: "/border/black-border.png" },
    { label: "White", value: "white", src: "/border/white-border.png" },
    { label: "Wrapped", value: "wrapped", src: "/border/wrapped-border.png" },
    { label: "Auto fill", value: "fill", src: "/border/fill-border.png" },
  ];

  return (
    <form>
      <dl className="mb-8">
        <dt className="mb-4 text-sm uppercase tracking-wide">Border style</dt>
        <dd className="flex flex-wrap gap-3">
          {options.map((option) => {
            const isActive = state.borderStyle === option.value;

            return (
              <button
                formAction={() => {
                  const newState = updateOption("borderStyle", option.value);
                  updateURL(newState);
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
