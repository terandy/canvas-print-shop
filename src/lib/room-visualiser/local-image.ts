import { prepareImageForUpload } from "@/lib/images/prepare-image";

export const MAX_PREVIEW_FILE_BYTES = 40 * 1024 * 1024;
export const MAX_PREVIEW_EDGE = 2048;

export async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

/** Never uploads, stores, or modifies the source file. Caller owns the returned URL. */
export async function prepareLocalPreview(file: File): Promise<string> {
  if (file.size > MAX_PREVIEW_FILE_BYTES) throw new Error("tooLarge");
  const prepared = await prepareImageForUpload(file);
  if (!prepared.ok) throw new Error(prepared.reason);
  const originalUrl = URL.createObjectURL(prepared.file);
  try {
    const image = await loadImage(originalUrl);
    const ratio = Math.min(
      1,
      MAX_PREVIEW_EDGE / Math.max(image.naturalWidth, image.naturalHeight)
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("decodeFailed");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error("decodeFailed"))),
        "image/jpeg",
        0.9
      )
    );
    canvas.width = 1;
    canvas.height = 1;
    return URL.createObjectURL(blob);
  } finally {
    URL.revokeObjectURL(originalUrl);
  }
}
