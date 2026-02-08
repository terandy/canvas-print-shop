"use client";

import React from "react";
import BorderStyleSelector from "./variantSelectors/border-style-selector";
import DirectionSelector from "./variantSelectors/direction-selector";
import FrameSelector from "./variantSelectors/frame-selector";
import { useProduct } from "@/contexts";
import AddToCart from "./add-to-cart";
import SaveCartItem from "./save-cart-item";
import SizeSelector from "./variantSelectors/size-selector";
import VariantSelector from "./variantSelectors/variant-selector";
import ProductTotal from "./product-total";
import ImageFile from "./image-file";
import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";

interface Props {}

const ProductForm: React.FC<Props> = () => {
  const { state, product, cartItemID } = useProduct();
  return (
    <>
      {"imgURL" in state && state.imgURL !== DEFAULT_CANVAS_IMAGE && (
        <ImageFile imgURL={state.imgURL} />
      )}
      {"direction" in state && <DirectionSelector />}
      {product.options.map((option) => {
        switch (option.name) {
          case "frame":
            return (
              <FrameSelector
                key={option.name}
                option={option}
                options={product.options}
                variants={product.variants}
              />
            );
          case "size":
            return (
              <SizeSelector
                key={option.name}
                option={option}
                options={product.options}
                variants={product.variants}
              />
            );
          default:
            return (
              <VariantSelector
                key={option.name}
                option={option}
                options={product.options}
                variants={product.variants}
              />
            );
        }
      })}
      {"borderStyle" in state && <BorderStyleSelector />}
      <ProductTotal />
      {!cartItemID ? <AddToCart /> : <SaveCartItem cartItemID={cartItemID} />}
    </>
  );
};

export default ProductForm;
