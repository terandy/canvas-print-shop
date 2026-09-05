/** All scene distances are metres. Product dimensions are inches. */
export const INCH_TO_METRE = 0.0254;
export const GALLERY_DEPTH_INCHES = 1.5;
export const ROOM = {
  sofaWidth: 2.4,
  sofaTop: 0.88,
  usableWidth: 3.8,
  usableBottom: 1.1,
  usableTop: 2.95,
  centreHeight: 1.72,
  cameraPosition: [2.5, 3.1, 8] as const,
  cameraTarget: [0, 1.45, 0.4] as const,
  cameraWidth: 5.8,
};
export const inchesToMetres = (inches: number) => inches * INCH_TO_METRE;
export type Dimensions = { width: number; height: number };
export type CropPosition = { x: number; y: number };
export type EdgeStyle = "wrapped" | "white" | "black";

export function placement({ width, height }: Dimensions) {
  const w = inchesToMetres(width);
  const h = inchesToMetres(height);
  const valid = Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
  const fits =
    valid && w <= ROOM.usableWidth && h <= ROOM.usableTop - ROOM.usableBottom;
  return {
    width: w,
    height: h,
    fits,
    valid,
    centreY: Math.min(
      ROOM.usableTop - h / 2,
      Math.max(ROOM.centreHeight, ROOM.usableBottom + h / 2)
    ),
  };
}

/** Cover crop in SOURCE pixels: aspect preserved, position 0..1 across spare pixels. */
export function coverCrop(
  sw: number,
  sh: number,
  aspect: number,
  position: CropPosition
) {
  const width = Math.min(sw, sh * aspect);
  const height = width / aspect;
  return {
    x: (sw - width) * Math.min(1, Math.max(0, position.x)),
    y: (sh - height) * Math.min(1, Math.max(0, position.y)),
    width,
    height,
  };
}

/** Physical wrap consumes 1.5 inches on every side; solid edges preserve the face. */
export function printCrop(
  sw: number,
  sh: number,
  size: Dimensions,
  position: CropPosition,
  edge: EdgeStyle
) {
  const d = edge === "wrapped" ? GALLERY_DEPTH_INCHES : 0;
  const full = coverCrop(
    sw,
    sh,
    (size.width + 2 * d) / (size.height + 2 * d),
    position
  );
  const px = full.width / (size.width + 2 * d);
  return {
    full,
    face: {
      x: full.x + d * px,
      y: full.y + d * px,
      width: size.width * px,
      height: size.height * px,
    },
    bleed: d * px,
  };
}
