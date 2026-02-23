import Loading from "@/app/[locale]/loading";
import { useResize } from "@/lib/hooks/useResize";
import clsx from "clsx";
import Image from "next/image";
import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface ImagePreviewerProps {
  /**
   * URL of the image
   */
  src: string;
  /**
   * Selected size of the product (e.g. 4x6)
   */
  size: string;
  /**
   * Selected direction of the product (e.g. Portrait or Landscape)
   */
  direction: string;
  /**
   * Selected style for the border
   */
  borderStyle: string;
  /**
   * Selected depth for the canvas in inches
   */
  depth: string;
  /**
   * Selected frame option (e.g. "black" or "none")
   */
  frame?: string;
}

interface CanvasProps {
  /**
   * width in px of the canvas
   */
  width: number;
  /**
   * height in px of the canvas
   */
  height: number;
  /**
   * thickness of the border in px of the canvas
   */
  thickness: number;
  /**
   * color of the tape on the border
   */
  borderStyle: string;
  /**
   * URL of the image
   */
  src: string;
}

// Helper function to check if element is in viewport
const isElementInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

const Badge: React.FC<ComponentPropsWithoutRef<"p">> = ({
  children,
  ...props
}) => {
  return (
    <div {...props}>
      <p
        className={
          "m-auto text-small px-3 py-1 rounded bg-gray-800 text-white w-min"
        }
      >
        {children}
      </p>
    </div>
  );
};

const Border: React.FC<ComponentPropsWithoutRef<"div">> = (props) => {
  return (
    <div
      {...props}
      className={clsx(
        "border border-gray-500 border-opacity-25 box-border",
        props.className
      )}
    />
  );
};

const Corner: React.FC<
  ComponentPropsWithoutRef<"div"> & { thickness: number }
> = ({ thickness, className, style, ...props }) => {
  return (
    <div
      {...props}
      className={clsx("bg-white", className)}
      style={{ width: `${thickness}px`, height: `${thickness}px`, ...style }}
    />
  );
};

const CanvasContainer: React.FC<
  CanvasProps & ComponentPropsWithoutRef<"div">
> = ({ children, thickness, width, height }) => {
  return (
    <div
      className="relative box-border"
      style={{
        padding: `${thickness}px`,
        width: `${width + thickness * 2}px`,
        height: `${height + thickness * 2}px`,
      }}
    >
      {children}
    </div>
  );
};

const FlatCanvas: React.FC<CanvasProps> = ({ width, src, height }) => {
  return (
    <>
      <div
        className="relative shadow-xl"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image
          src={src}
          alt="Preview"
          className="object-cover" // will cause the image to fill the entire container and be cropped to preserve aspect ratio
          fill // Fill the parent element
        />
      </div>
    </>
  );
};

const CanvasWithBorder: React.FC<CanvasProps> = ({
  width,
  src,
  height,
  thickness,
  borderStyle,
}) => {
  return (
    <>
      <div
        className="relative shadow-xl"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image
          src={src}
          alt="Preview"
          className="object-cover" // will cause the image to fill the entire container and be cropped to preserve aspect ratio
          fill // Fill the parent element
        />
      </div>
      <Border
        className="absolute top-0"
        style={{
          height: `${thickness}px`,
          width: `${width}px`,
          left: `${thickness}px`,
          backgroundColor: borderStyle,
        }}
      />
      <Border
        className="absolute right-0"
        style={{
          width: `${thickness}px`,
          height: `${height}px`,
          top: `${thickness}px`,
          backgroundColor: borderStyle,
        }}
      />
      <Border
        className="absolute bottom-0"
        style={{
          height: `${thickness}px`,
          width: `${width}px`,
          left: `${thickness}px`,
          backgroundColor: borderStyle,
        }}
      />
      <Border
        className="absolute left-0"
        style={{
          width: `${thickness}px`,
          height: `${height}px`,
          top: `${thickness}px`,
          backgroundColor: borderStyle,
        }}
      />
    </>
  );
};

const WrappedCanvas: React.FC<CanvasProps> = ({
  thickness,
  src,
  width,
  height,
}) => {
  return (
    <>
      <Image
        src={src}
        alt="Preview"
        className="object-cover" // will cause the image to fill the entire container and be cropped to preserve aspect ratio
        fill // Fill the parent element
      />
      <div
        className="relative shadow-2xl border border-opacity-10 border-gray-500"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <Border
        className="absolute top-0 bg-white bg-opacity-50"
        style={{
          height: `${thickness}px`,
          width: `${width}px`,
          left: `${thickness}px`,
        }}
      />
      <Border
        className="absolute right-0 bg-white bg-opacity-50"
        style={{
          width: `${thickness}px`,
          height: `${height}px`,
          top: `${thickness}px`,
        }}
      />
      <Border
        className="absolute bottom-0 bg-white bg-opacity-50"
        style={{
          height: `${thickness}px`,
          width: `${width}px`,
          left: `${thickness}px`,
        }}
      />
      <Border
        className="absolute left-0 bg-white bg-opacity-50"
        style={{
          width: `${thickness}px`,
          height: `${height}px`,
          top: `${thickness}px`,
        }}
      />
      <Corner className="absolute top-0 left-0" thickness={thickness} />
      <Corner className="absolute top-0 right-0" thickness={thickness} />
      <Corner className="absolute bottom-0 right-0" thickness={thickness} />
      <Corner className="absolute bottom-0 left-0" thickness={thickness} />
    </>
  );
};

const FilledBorderCanvas: React.FC<CanvasProps> = ({
  width,
  src,
  height,
  thickness,
}) => {
  return (
    <>
      <Image
        src={src}
        alt="Preview"
        className="object-cover" // will cause the image to fill the entire container and be cropped to preserve aspect ratio
        fill // Fill the parent element
      />
      <div
        className="relative shadow-xl"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image
          src={src}
          alt="Preview"
          className="object-cover" // will cause the image to fill the entire container and be cropped to preserve aspect ratio
          fill // Fill the parent element
        />
      </div>
      <Border
        className="absolute top-0 bg-white bg-opacity-50"
        style={{
          height: `${thickness}px`,
          width: `${width}px`,
          left: `${thickness}px`,
        }}
      />
      <Border
        className="absolute right-0 bg-white bg-opacity-50"
        style={{
          width: `${thickness}px`,
          height: `${height}px`,
          top: `${thickness}px`,
        }}
      />
      <Border
        className="absolute bottom-0 bg-white bg-opacity-50"
        style={{
          height: `${thickness}px`,
          width: `${width}px`,
          left: `${thickness}px`,
        }}
      />
      <Border
        className="absolute left-0 bg-white bg-opacity-50"
        style={{
          width: `${thickness}px`,
          height: `${height}px`,
          top: `${thickness}px`,
        }}
      />
      <Corner className="absolute top-0 left-0" thickness={thickness} />
      <Corner className="absolute top-0 right-0" thickness={thickness} />
      <Corner className="absolute bottom-0 right-0" thickness={thickness} />
      <Corner className="absolute bottom-0 left-0" thickness={thickness} />
    </>
  );
};

const Canvas: React.FC<CanvasProps> = (props) => {
  if (props.borderStyle === "wrapped") return <WrappedCanvas {...props} />;
  if (props.borderStyle === "none") return <FlatCanvas {...props} />;
  if (props.borderStyle === "fill") return <FilledBorderCanvas {...props} />;
  return <CanvasWithBorder {...props} />;
};

const TOP_NAVBAR_HEIGHT = 76;
const MEASUREMENT_GAP = 40 + 8;
const ADDITIONAL_PADDING = 24;

const FRAME_GAP_IN = 0.15;
const FRAME_BORDER_IN = 0.75 - FRAME_GAP_IN;

const CanvasPreviewer: React.FC<
  ImagePreviewerProps & ComponentPropsWithoutRef<"div">
> = ({
  src,
  size,
  direction,
  borderStyle = "wrapped",
  depth = "regular",
  frame = "none",
  ...props
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const resize = useResize(componentRef);
  const [canvasProps, setCanvasProps] = useState<CanvasProps>();
  const [frameState, setFrameState] = useState({ framePx: 0, frameGapPx: 0 });
  const sizeArray = size.split("x").map(Number);
  const [x, y] =
    direction === "landscape"
      ? [sizeArray[1], sizeArray[0]]
      : [sizeArray[0], sizeArray[1]];

  useLayoutEffect(() => {
    const containerWidth =
      document
        .getElementById("product-image-preview-container")
        ?.getBoundingClientRect().width ??
      0 - MEASUREMENT_GAP - 2 * ADDITIONAL_PADDING;

    const containerHeight =
      document.documentElement.clientHeight -
      TOP_NAVBAR_HEIGHT -
      MEASUREMENT_GAP -
      2 * ADDITIONAL_PADDING;

    // Calculate pixels per inch based on the canvas dimensions and available space
    let pixelsPerInch: number;
    let width: number;
    let height: number;
    let thicknessPx: number;
    const showFrame = frame === "black";
    const canvasThicknessIn = depth === "regular" ? 0.75 : 1.75;
    // When framed, edges are hidden — thickness doesn't affect visible layout
    const visibleThicknessIn = showFrame ? 0 : canvasThicknessIn;
    const frameIn = showFrame ? FRAME_BORDER_IN : 0;
    const frameGapIn = showFrame ? FRAME_GAP_IN : 0;
    const totalEdgeIn = visibleThicknessIn + frameIn + frameGapIn;

    if (direction === "landscape") {
      // For landscape, fit to container width considering edges
      const totalWidthInches = x + 2 * totalEdgeIn;
      pixelsPerInch = containerWidth / totalWidthInches;

      width = x * pixelsPerInch;
      height = y * pixelsPerInch;
      thicknessPx = canvasThicknessIn * pixelsPerInch;
    } else {
      // For portrait, fit to container height considering edges
      const totalHeightInches = y + 2 * totalEdgeIn;
      pixelsPerInch = containerHeight / totalHeightInches;

      width = x * pixelsPerInch;
      height = y * pixelsPerInch;
      thicknessPx = canvasThicknessIn * pixelsPerInch;
    }

    const framePx = frameIn * pixelsPerInch;
    const frameGapPx = frameGapIn * pixelsPerInch;

    // Check if the calculated dimensions fit within the container
    const totalHeight =
      height +
      (thicknessPx + framePx + frameGapPx) * 2 +
      MEASUREMENT_GAP +
      2 * ADDITIONAL_PADDING;
    const totalWidth =
      width +
      (thicknessPx + framePx + frameGapPx) * 2 +
      MEASUREMENT_GAP +
      2 * ADDITIONAL_PADDING;

    // If it doesn't fit, scale down proportionally
    if (totalHeight > containerHeight || totalWidth > containerWidth) {
      const scaleFactorHeight = containerHeight / totalHeight;
      const scaleFactorWidth = containerWidth / totalWidth;
      const scaleFactor = Math.min(scaleFactorHeight, scaleFactorWidth);

      width *= scaleFactor;
      height *= scaleFactor;
      thicknessPx *= scaleFactor;
    }

    setCanvasProps({
      width,
      height,
      thickness: thicknessPx,
      borderStyle,
      src,
    });
    setFrameState({ framePx, frameGapPx });
  }, [
    x,
    y,
    depth,
    setCanvasProps,
    borderStyle,
    src,
    direction,
    frame,
    resize.height,
    resize.width,
  ]);

  // Watch for changes in props and state that should trigger scrolling
  useEffect(() => {
    if (componentRef.current) {
      const element = componentRef.current;

      // Only scroll if element is not already in view
      if (!isElementInViewport(element)) {
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.scrollY;
        const targetPosition = absoluteElementTop - 76; // Position 96px from top
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    }
  }, [src, size, direction, borderStyle, depth, frame]);

  if (!canvasProps) return <Loading message={"Loading canvas preview"} />;

  const showFrame = frame === "black";

  return (
    <div {...props} ref={componentRef}>
      <div className="grid grid-cols-[auto,1fr] gap-1 w-min mx-auto">
        <Badge>{x}</Badge>
        <div />
        {showFrame ? (
          <div
            className="border-black box-border bg-gray-900"
            style={{
              borderWidth: `${frameState.framePx}px`,
              padding: `${frameState.frameGapPx}px`,
            }}
          >
            <div
              className="overflow-hidden"
              style={{
                width: `${canvasProps.width}px`,
                height: `${canvasProps.height}px`,
              }}
            >
              <div
                style={{
                  marginTop: `-${canvasProps.thickness}px`,
                  marginLeft: `-${canvasProps.thickness}px`,
                }}
              >
                <CanvasContainer {...canvasProps}>
                  <Canvas {...canvasProps} />
                </CanvasContainer>
              </div>
            </div>
          </div>
        ) : (
          <CanvasContainer {...canvasProps}>
            <Canvas {...canvasProps} />
          </CanvasContainer>
        )}
        <Badge className="w-min flex align-middle">{y}</Badge>
      </div>
    </div>
  );
};

export default CanvasPreviewer;
