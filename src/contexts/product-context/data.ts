import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";
import { FormState } from "./types";

export const INITIAL_FORM_STATE: FormState = {
  borderStyle: "wrapped",
  size: "8x10",
  frame: "none",
  direction: "landscape",
  imgURL: DEFAULT_CANVAS_IMAGE,
};
