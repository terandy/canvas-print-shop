"use client";

import VariantSelector from "./variantSelectors/variant-selector";
import React from "react";
import BorderStyleSelector from "./variantSelectors/border-style-selector";
import DirectionSelector from "./variantSelectors/direction-selector";
import FrameSelector from "./variantSelectors/frame-selector";
import { useProduct } from "@/contexts";
import ImageUploader from "./image-uploader";
import AddToCart from "./add-to-cart";
import SaveCartItem from "./save-cart-item";

interface Props {}

const ProductForm: React.FC<Props> = () => {
  const { variant, state, product, cartItemID } = useProduct();
  return (
    <>
      {"imgURL" in state && <ImageUploader />}
      {product.options.map((option) => {
        switch (option.name) {
          case "frame":
            return (
              <FrameSelector
                key={option.id}
                option={option}
                options={product.options}
                variants={product.variants}
              />
            );
          default:
            return (
              <VariantSelector
                key={option.id}
                option={option}
                options={product.options}
                variants={product.variants}
              />
            );
        }
      })}
      {"direction" in state && <DirectionSelector />}
      {"borderStyle" in state && <BorderStyleSelector />}
      {!cartItemID ? <AddToCart /> : <SaveCartItem cartItemID={cartItemID} />}
    </>
  );
};

export default ProductForm;
