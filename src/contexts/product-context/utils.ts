import { INITIAL_FORM_STATE } from "./data";
import { CanvasFormState, CanvasRollFormState } from "./types";

export const getInitialFormState = (productHandle: string) => {
  switch (productHandle) {
    case "canvas-roll-prints":
      return {
        size: INITIAL_FORM_STATE.size,
        direction: INITIAL_FORM_STATE.direction,
        imgURL: INITIAL_FORM_STATE.imgURL,
      } as CanvasRollFormState;
    case "canvas":
    default:
      return INITIAL_FORM_STATE as CanvasFormState;
  }
};
