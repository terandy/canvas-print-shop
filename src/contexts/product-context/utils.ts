import { INITIAL_FORM_STATE } from "./data";
import { CanvasFormState, CanvasRollFormState } from "./types";

export const getInitialFormState = (productHandle: string) => {
  switch (productHandle) {
    // Rolled canvas: no frame and no depth, because nothing is stretched. The
    // handle here previously read "canvas-roll-prints", which matched no
    // product, so this branch never ran and rolls fell through to the
    // stretched defaults.
    case "canvas-rolls":
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
