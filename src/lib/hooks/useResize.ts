"use client";
import { MutableRefObject, useEffect, useState } from "react";

interface Dimensions {
  width: number;
  height: number;
}

export const useResize = (
  targetRef: MutableRefObject<HTMLElement | null>
): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    if (!targetRef.current) return;

    // Check if ResizeObserver is available in the environment
    if (typeof ResizeObserver === "undefined") {
      // Fallback measurements if ResizeObserver is not available
      const updateDimensions = () => {
        if (targetRef.current) {
          const { offsetWidth, offsetHeight } = targetRef.current;
          setDimensions({
            width: offsetWidth,
            height: offsetHeight,
          });
        }
      };

      // Initial measurement
      updateDimensions();

      // Listen to window resize as fallback
      window.addEventListener("resize", updateDimensions);

      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    } else {
      // Use ResizeObserver if available
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      });

      observer.observe(targetRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return dimensions;
};
