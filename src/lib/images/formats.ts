/**
 * Image formats the upload widgets accept.
 *
 * `DISPLAYABLE_IMAGE_TYPES` are the formats every current browser can render in
 * an `<img>`, so they go to S3 untouched. HEIC/HEIF — the iPhone camera default
 * — is only decodable by Safari, so it is converted to JPEG in the browser
 * before upload (see `prepare-image.ts`). Anything else is rejected, because an
 * image the browser cannot decode breaks the canvas preview and the print file.
 */
export const DISPLAYABLE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const HEIC_IMAGE_TYPES = [
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
] as const;

/** Human-readable labels derived from the operationally accepted formats. */
export const ACCEPTED_IMAGE_FORMAT_LABELS = [
  "JPG",
  "JPEG",
  "PNG",
  "WebP",
  "AVIF",
  "GIF",
  "HEIC",
  "HEIF",
] as const;

export const formatAcceptedImageFormats = (locale: string): string =>
  new Intl.ListFormat(locale, {
    style: "long",
    type: "disjunction",
  }).format(ACCEPTED_IMAGE_FORMAT_LABELS);

/** Types the server will hand out a presigned upload URL for. */
export const UPLOADABLE_IMAGE_TYPES: readonly string[] = [
  ...DISPLAYABLE_IMAGE_TYPES,
  ...HEIC_IMAGE_TYPES,
];

/**
 * Value for an `<input type="file">` accept attribute. The extensions are not
 * redundant: Windows has no registered MIME type for HEIC, so Chrome reports an
 * empty `file.type` and would grey the files out if we matched on MIME alone.
 */
export const IMAGE_ACCEPT_ATTRIBUTE = [
  ...UPLOADABLE_IMAGE_TYPES,
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".heic",
  ".heif",
].join(",");

const EXTENSION_TO_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

/**
 * The MIME type of a picked file, falling back to its extension.
 *
 * `file.type` comes from the OS registry and is empty surprisingly often — HEIC
 * on Windows, and most files dragged in from an archive or a network share.
 */
export function resolveImageType(file: File): string {
  if (file.type) return file.type.toLowerCase();

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_TYPE[extension] ?? "";
}
