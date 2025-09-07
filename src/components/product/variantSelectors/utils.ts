/**
 * Interface for image data
 */
interface ImageData {
  width: number;
  height: number;
  fileSize?: number;
}

/**
 * Filters available print sizes based on image quality
 *
 * @param imageData - Information about the uploaded image
 * @param availableSizes - Array of available print sizes
 * @param minDPI - Minimum acceptable DPI (dots per inch), default 150
 *
 * @returns Filtered list of sizes that meet quality requirements
 */
export async function filterPrintSizes(
  imageFile: File,
  availableSizes: string[],
  minDPI: number = 150
) {
  const imageData = await getImageDimensions(imageFile);
  // Validate input parameters
  if (!imageData || !imageData.width || !imageData.height) {
    throw new Error("Image data must include width and height in pixels");
  }

  if (!Array.isArray(availableSizes) || availableSizes.length === 0) {
    throw new Error("Available sizes must be a non-empty array");
  }

  // Filter sizes based on DPI requirements
  const suitableSizes = availableSizes.filter((size) => {
    const [height, width] = size.split("x");
    if (!height || !width) return false;
    // Calculate DPI for width and height
    const widthDPI = imageData.width / Number(width);
    const heightDPI = imageData.height / Number(height);

    // Use the lower DPI (limiting factor)
    const effectiveDPI = Math.min(widthDPI, heightDPI);

    // Return true if the effective DPI meets or exceeds the minimum requirement
    return effectiveDPI >= minDPI;
  });

  return suitableSizes;
}

/**
 * Gets dimensions from an image File object
 *
 * @param imageFile - The uploaded image file
 *
 * @returns Promise resolving to image dimensions
 */
export async function getImageDimensions(imageFile: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src); // Clean up
      resolve({
        width: img.width,
        height: img.height,
        fileSize: imageFile.size,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src); // Clean up
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(imageFile);
  });
}
