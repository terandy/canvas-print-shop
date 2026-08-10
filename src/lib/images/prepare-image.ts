"use client";

import {
  DISPLAYABLE_IMAGE_TYPES,
  HEIC_IMAGE_TYPES,
  resolveImageType,
} from "./formats";

export type PrepareImageResult =
  | { ok: true; file: File }
  | { ok: false; reason: "unsupportedType" | "conversionFailed" };

/** Canvas prints are large, so keep more detail than a web-preview default. */
const HEIC_JPEG_QUALITY = 0.92;

/** ISOBMFF major brands that mark a file as HEIC/HEIF. */
const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "heim",
  "heis",
  "hevc",
  "hevx",
  "hevm",
  "hevs",
  "mif1",
  "msf1",
]);

/** Byte-exact ASCII read — TextDecoder would collapse multi-byte sequences. */
function ascii(bytes: Uint8Array, start: number, end: number): string {
  let text = "";
  for (let i = start; i < end; i += 1) {
    text += String.fromCharCode(bytes[i]);
  }
  return text;
}

async function isHeic(file: File, type: string): Promise<boolean> {
  if ((HEIC_IMAGE_TYPES as readonly string[]).includes(type)) return true;
  if ((DISPLAYABLE_IMAGE_TYPES as readonly string[]).includes(type)) {
    return false;
  }

  // Unknown type: read the ISOBMFF header rather than trust the file name.
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (header.byteLength < 12) return false;

  if (ascii(header, 4, 8) !== "ftyp") return false;
  return HEIC_BRANDS.has(ascii(header, 8, 12).replace(/\0/g, " ").trim());
}

function toJpegName(name: string): string {
  return `${name.replace(/\.[^.]+$/, "")}.jpg`;
}

/**
 * Validate a picked file and return the one that should actually be uploaded.
 *
 * HEIC/HEIF is decoded to JPEG here, in the browser, so everything downstream —
 * the preview, `next/image`, the print file — only ever sees a format it can
 * open. The converter is ~3 MB of WebAssembly, so it is imported lazily and
 * only for the people who need it.
 */
export async function prepareImageForUpload(
  file: File
): Promise<PrepareImageResult> {
  const type = resolveImageType(file);

  if (await isHeic(file, type)) {
    try {
      const { heicTo } = await import("heic-to");
      const jpeg = await heicTo({
        blob: file,
        type: "image/jpeg",
        quality: HEIC_JPEG_QUALITY,
      });

      return {
        ok: true,
        file: new File([jpeg], toJpegName(file.name), {
          type: "image/jpeg",
          lastModified: file.lastModified,
        }),
      };
    } catch (error) {
      console.error("Error converting HEIC image:", error);
      return { ok: false, reason: "conversionFailed" };
    }
  }

  if (!(DISPLAYABLE_IMAGE_TYPES as readonly string[]).includes(type)) {
    return { ok: false, reason: "unsupportedType" };
  }

  // Re-wrap when the browser gave us no type, so the S3 PUT and the stored
  // object still carry a real Content-Type.
  if (file.type === type) return { ok: true, file };

  return {
    ok: true,
    file: new File([file], file.name, {
      type,
      lastModified: file.lastModified,
    }),
  };
}
