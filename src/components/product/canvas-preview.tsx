import Loading from '@/app/loading';
import clsx from 'clsx';
import Image from 'next/image';
import React, { ComponentPropsWithoutRef, useLayoutEffect, useState } from 'react';

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

const Badge: React.FC<ComponentPropsWithoutRef<"p">> = ({ children, ...props }) => {
    return <div {...props}><p className={"m-auto text-small px-3 py-1 rounded bg-gray-800 text-white w-min"}>{children}</p></div>
}

const Border: React.FC<ComponentPropsWithoutRef<"div">> = (props) => {
    return <div {...props} className={clsx("border border-gray-500 border-opacity-25 box-border", props.className)} />
}

const Corner: React.FC<ComponentPropsWithoutRef<"div"> & { thickness: number }> = ({ thickness, className, style, ...props }) => {
    return <div {...props} className={clsx("bg-white", className)} style={{ width: `${thickness}px`, height: `${thickness}px`, ...style }} />
}

const CanvasContainer: React.FC<CanvasProps & ComponentPropsWithoutRef<"div">> = ({ children, thickness, width, height }) => {
    return (
        <div className="relative box-border" style={{ padding: `${thickness}px`, width: `${width + thickness * 2}px`, height: `${height + thickness * 2}px` }}>
            {children}
        </div>)
}

const CanvasWithBorder: React.FC<CanvasProps> = ({ width, src, height, thickness, borderStyle }) => {
    return <>
        <div className="relative shadow-xl" style={{ width: `${width}px`, height: `${height}px` }}>
            <Image
                src={src}
                alt="Preview"
                className="object-cover" // will cause the image to fill the entire container and be cropped to preserve aspect ratio
                fill // Fill the parent element
            />
        </div>
        <Border className="absolute top-0" style={{ height: `${thickness}px`, width: `${width}px`, left: `${thickness}px`, backgroundColor: borderStyle }} />
        <Border className="absolute right-0" style={{ width: `${thickness}px`, height: `${height}px`, top: `${thickness}px`, backgroundColor: borderStyle }} />
        <Border className="absolute bottom-0" style={{ height: `${thickness}px`, width: `${width}px`, left: `${thickness}px`, backgroundColor: borderStyle }} />
        <Border className="absolute left-0" style={{ width: `${thickness}px`, height: `${height}px`, top: `${thickness}px`, backgroundColor: borderStyle }} />
    </>
}

const WrappedCanvas: React.FC<CanvasProps> = ({ thickness, src, width, height }) => {
    return <>
        <Image
            src={src}
            alt="Preview"
            className="object-cover" // will cause the image to fill the entire container and be cropped to preserve aspect ratio
            fill // Fill the parent element
        />
        <div className="relative shadow-2xl border border-opacity-10 border-gray-500" style={{ width: `${width}px`, height: `${height}px` }} />
        <Corner className="absolute top-0 left-0" thickness={thickness} />
        <Corner className="absolute top-0 right-0" thickness={thickness} />
        <Corner className="absolute bottom-0 right-0" thickness={thickness} />
        <Corner className="absolute bottom-0 left-0" thickness={thickness} />
    </>
}

const CanvasPreviewer: React.FC<ImagePreviewerProps & ComponentPropsWithoutRef<"div">> = ({
    src,
    size,
    direction,
    borderStyle = "white",
    ...props
}) => {
    const [canvasProps, setCanvasProps] = useState<CanvasProps>();
    const sizeArray = size.split('x').map(Number);
    const [x, y] = direction === "landscape" ? [sizeArray[1], sizeArray[0]] : [sizeArray[0], sizeArray[1]];

    useLayoutEffect(() => {
        const containerWidth = document.body.getBoundingClientRect().width;
        const getWidth = () => {
            if (containerWidth > 768) return direction === "landscape" ? containerWidth * 1 / 2 : containerWidth * 1 / 4;
            return containerWidth / 2;
        }
        const width = getWidth();
        const height = (y / x) * width;
        const thickness = width / x;
        setCanvasProps({ width, height, thickness, borderStyle, src })
    }, [x, y, setCanvasProps, borderStyle, src, direction])

    if (!canvasProps) return <Loading message={"Loading canvas preview"} />;

    return (
        <div {...props}>
            <div className="grid grid-cols-[auto,1fr] gap-1 w-min mx-auto">
                <Badge>{x}</Badge>
                <div />
                <CanvasContainer {...canvasProps}>
                    {borderStyle !== "wrapped"
                        ? <CanvasWithBorder {...canvasProps} />
                        : <WrappedCanvas {...canvasProps} />}
                </CanvasContainer>
                <Badge className="w-min flex align-middle">{y}</Badge>
            </div>
        </div >
    );
};

export default CanvasPreviewer;