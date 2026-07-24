import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";
import { FormState } from "./types";

export const INITIAL_FORM_STATE: FormState = {
  borderStyle: "wrapped",
  size: "8x10",
  frame: "none",
  direction: "landscape",
  depth: "gallery",
  imgURL: DEFAULT_CANVAS_IMAGE,
};

/**
 * State that effects price
 */
export const BASE_STATE: FormState = {
  size: "8x10",
  frame: "none",
  depth: "gallery",
};

/**
 * Frames are only fitted to regular-depth canvases, and unframed prints are
 * always gallery depth. Depth is therefore never picked directly — it follows
 * from the frame. Any other combination is not sold.
 */
export const depthForFrame = (frame: string): string =>
  frame === "none" ? "gallery" : "regular";
