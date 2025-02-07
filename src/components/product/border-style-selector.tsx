"use-client";

import { useProduct, useUpdateURL } from "@/contexts/product-context";
import clsx from "clsx";

const BorderStyleSelector = () => {
    const { state, updateOption } = useProduct();
    const updateURL = useUpdateURL();
    const options = [{ label: "black" }, { label: "white" }, { label: "wrapped" }]
    return <form >
        <dl className="mb-8">
            <dt className="mb-4 text-sm uppercase tracking-wide">Border style</dt>
            <dd className="flex flex-wrap gap-3">
                {options.map((option) => {
                    const isActive = state.borderStyle === option.label;

                    return (
                        <button
                            formAction={() => {
                                const newState = updateOption("borderStyle", option.label);
                                updateURL(newState);
                            }}
                            key={option.label}
                            title={`${option.label}`}
                            className={clsx(
                                "flex min-w-[48px] items-center justify-center rounded-full border bg-neutral-100 px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900",
                                {
                                    "cursor-default ring-2 ring-blue-600": isActive,
                                    "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600":
                                        !isActive,
                                }
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

export default BorderStyleSelector;