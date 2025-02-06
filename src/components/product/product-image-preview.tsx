"use client";

import React from 'react';
import Gallery from './product-gallery';
import { useProduct } from '@/contexts/product-context';
import * as types from '@/lib/shopify/types';
import CanvasPreviewer from './canvas-preview';

interface Props {
    product: types.Product;
    className?: string;
}

export const ProductImagePreview: React.FC<Props> = ({ product, className }) => {
    const { state } = useProduct();

    if (state.imgURL) {
        return <CanvasPreviewer
            className={className}
            src={state.imgURL}
            size={state.size ?? product.options.find(opt => opt.name === "Size")?.values[0]}
            direction={state.direction}
            borderStyle={state.borderStyle}
        />
    }
    return <Gallery
        images={product.images.slice(0, 5).map((image: types.Image) => ({
            src: image.url,
            altText: image.altText ?? "",
        }))}
    />
}