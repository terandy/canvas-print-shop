"use client";

import React from "react";
import BorderStyleSelector from "./variantSelectors/border-style-selector";
import DirectionSelector from "./variantSelectors/direction-selector";
import FrameSelector from "./variantSelectors/frame-selector";
import { useProduct } from "@/contexts";
import ImageUploader from "./image-uploader";
import AddToCart from "./add-to-cart";
import SaveCartItem from "./save-cart-item";
import SizeSelector from "./variantSelectors/size-selector";
import VariantSelector from "./variantSelectors/variant-selector";

interface Props {}

const ProductForm: React.FC<Props> = () => {
  const { state, product, cartItemID } = useProduct();
  return (
    <>
      {"imgURL" in state && <ImageUploader />}
      {"direction" in state && <DirectionSelector />}
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
          case "size":
            return (
              <SizeSelector
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
      {"borderStyle" in state && <BorderStyleSelector />}
      {!cartItemID ? <AddToCart /> : <SaveCartItem cartItemID={cartItemID} />}
    </>
  );
};

export default ProductForm;
