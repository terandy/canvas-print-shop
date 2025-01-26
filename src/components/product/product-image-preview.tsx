"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from "next/image";
import Gallery from './product-gallery';
import { useProduct } from '@/contexts/product-context';
import * as types from '@/lib/shopify/types';

interface Props {
    product: types.Product;
}

export const ProductImagePreview: React.FC<Props> = ({ product }) => {
    const { state } = useProduct();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (!containerRef.current) return;
            const container = containerRef.current;
            const rect = container.getBoundingClientRect();
            setContainerDimensions({
                width: rect.width,
                height: Math.min(rect.width, 550) // Max height of 550px as per parent container
            });
        };

        // Initial calculation
        updateDimensions();

        // Update on resize
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const getSize = () => {
        const size = state.size ?? product.options.find(opt => opt.name === "Size")?.values[0]!;
        const [width, height] = size.split('x').map(Number);
        return { width, height, aspectRatio: height / width };
    };

    const getFrameWidth = () => {
        if (state.frame === "None") return 0;
        const { width } = getSize();
        const frameInches = 0.25;
        return (frameInches / width) * containerDimensions.width;
    };

    const getBorderWidth = () => {
        const scaleFactor = containerDimensions.width / 800;
        switch (state.border) {
            case 'small': return 24 * scaleFactor;
            case 'medium': return 64 * scaleFactor;
            case 'large': return 120 * scaleFactor;
            default: return 0;
        }
    };

    const getFrameColor = () => {
        switch (state.frame) {
            case "Black": return "black";
            case "White": return "white";
            case "Wood": return "rgb(210, 190, 160)";
            case "None": return "transparent";
            default: return "white";
        }
    }

    const calculateDimensions = () => {
        const { aspectRatio } = getSize();
        const frameWidth = getFrameWidth() * 2;
        const borderWidth = getBorderWidth() * 2;
        const totalInset = frameWidth + borderWidth;

        let baseWidth, baseHeight;
        const containerWidth = containerDimensions.width;
        const containerHeight = containerDimensions.height;

        if (state.format === 'Landscape') {
            if (containerWidth * aspectRatio <= containerHeight) {
                baseWidth = containerWidth;
                baseHeight = containerWidth * aspectRatio;
            } else {
                baseHeight = containerHeight;
                baseWidth = containerHeight / aspectRatio;
            }
        } else {
            if (containerWidth / aspectRatio <= containerHeight) {
                baseWidth = containerWidth;
                baseHeight = containerWidth / aspectRatio;
            } else {
                baseHeight = containerHeight;
                baseWidth = containerHeight * aspectRatio;
            }
        }

        return {
            containerWidth: baseWidth,
            containerHeight: baseHeight,
            frameInnerWidth: baseWidth - frameWidth,
            frameInnerHeight: baseHeight - frameWidth,
            imageWidth: baseWidth - totalInset,
            imageHeight: baseHeight - totalInset
        };
    };

    const dimensions = calculateDimensions();
    const frameWidth = getFrameWidth();
    const borderWidth = getBorderWidth();


    return (
        <div ref={containerRef} className="flex justify-center items-center w-full h-full">
            {state.imgURL ? <div className="relative" style={{ perspective: '1000px' }}>
                <div
                    className="relative shadow-2xl transform-gpu"
                    style={{
                        width: `${dimensions.containerWidth}px`,
                        height: `${dimensions.containerHeight}px`,
                        backgroundColor: getFrameColor(),
                        boxShadow: state.frame === "None" ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                        transform: 'rotateX(2deg)',
                        transformOrigin: 'bottom'
                    }}
                >
                    {state.frame === "None" ? (
                        <Image
                            src={state.imgURL}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes={`${Math.max(dimensions.containerWidth, dimensions.containerHeight)}px`}
                        />
                    ) : (
                        <div
                            className="absolute bg-white"
                            style={{
                                width: `${dimensions.frameInnerWidth}px`,
                                height: `${dimensions.frameInnerHeight}px`,
                                left: `${frameWidth}px`,
                                top: `${frameWidth}px`,
                                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            {borderWidth > 0 && (
                                <div
                                    className="absolute"
                                    style={{
                                        width: `${dimensions.imageWidth}px`,
                                        height: `${dimensions.imageHeight}px`,
                                        left: `${borderWidth}px`,
                                        top: `${borderWidth}px`,
                                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)'
                                    }}
                                >
                                    <Image
                                        src={state.imgURL}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        sizes={`${Math.max(dimensions.imageWidth, dimensions.imageHeight)}px`}
                                    />
                                </div>
                            )}
                            {borderWidth === 0 && (
                                <Image
                                    src={state.imgURL}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                    sizes={`${Math.max(dimensions.frameInnerWidth, dimensions.frameInnerHeight)}px`}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div> : (
                <Gallery
                    images={product.images.slice(0, 5).map((image: types.Image) => ({
                        src: image.url,
                        altText: image.altText ?? "",
                    }))}
                />
            )}
        </div>
    );
};

export default ProductImagePreview;