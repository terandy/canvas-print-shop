"use-client";

import { useProduct, useUpdateURL } from "@/contexts/product-context";
import clsx from "clsx";
import { RectangleHorizontal, RectangleVertical } from "lucide-react";

const DirectionSelector = () => {
    const { state, updateOption } = useProduct();
    const updateURL = useUpdateURL();
    const options = [{ label: "Landscape", value: "landscape", className: "w-24 h-16" }, { label: "Portrait", value: "portrait", className: "h-24 w-16" }]
    return <form >
        <dl className="mb-8">
            <dt className="mb-4 text-sm uppercase tracking-wide">Direction</dt>
            <dd className="flex gap-3 items-center">
                {options.map((option) => {
                    const isActive = state.direction?.toLowerCase() === option.value?.toLowerCase();

                    return (
                        <button
                            formAction={() => {
                                const newState = updateOption("direction", option.value);
                                updateURL(newState);
                            }}
                            key={option.label}
                            title={`${option.label}`}
                            className={clsx(
                                "flex items-center justify-center rounded border bg-neutral-100 p-1 text-xs dark:border-neutral-800 dark:bg-neutral-900",
                                {
                                    "cursor-default ring-2 ring-blue-600": isActive,
                                    "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600":
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
}

export default DirectionSelector;