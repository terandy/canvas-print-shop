import { INITIAL_FORM_STATE } from "./data";
import { CanvasFormState, CanvasRollFormState } from "./types";
import type { FormState } from "./types";
import type { Product, ProductVariant } from "@/types/product";

/** Invalid or stale selections must never substitute a different item. */
export function getSelectedVariant(
  product: Pick<Product, "options" | "variants">,
  state: FormState
): ProductVariant | undefined {
  if (
    !product.options.every((option) =>
      option.values.includes(state[option.name])
    )
  ) {
    return undefined;
  }

  return product.variants.find(
    (variant) =>
      variant.availableForSale &&
      product.options.every(
        (option) => variant.options[option.name] === state[option.name]
      ) &&
      Object.entries(variant.options).every(
        ([name, value]) => state[name] === value
      )
  );
}

export const getInitialFormState = (productHandle: string) => {
  switch (productHandle) {
    // Rolled canvas: no frame and no depth, because nothing is stretched. The
    // handle here previously read "canvas-roll-prints", which matched no
    // product, so this branch never ran and rolls fell through to the
    // stretched defaults.
    case "canvas-rolls":
    case "rolled-canvas-prints":
      return {
        size: INITIAL_FORM_STATE.size,
        direction: INITIAL_FORM_STATE.direction,
        imgURL: INITIAL_FORM_STATE.imgURL,
        // Flat render: no wrapped edges to draw on a print that ships in a tube.
        borderStyle: "none",
        margin: "with",
      } as CanvasRollFormState;
    case "canvas":
    default:
      return INITIAL_FORM_STATE as CanvasFormState;
  }
};
