"use client";

import { Product } from "@/lib/shopify/types";
import VariantSelector from "./variantSelectors/variant-selector";
import React from "react";
import { AddToCart } from "../cart";
import { SaveCartItem } from "../cart";
import BorderStyleSelector from "./variantSelectors/border-style-selector";
import DirectionSelector from "./variantSelectors/direction-selector";
import FrameSelector from "./variantSelectors/frame-selector";
import { useProduct } from "@/contexts";
import ImageUploader from "./image-uploader";

interface Props {
  product: Product;
  cartItemID?: string;
}

const ProductForm: React.FC<Props> = ({ product, cartItemID }) => {
  const { variant, state } = useProduct();
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
      {!cartItemID ? (
        <AddToCart variant={variant} formState={state} />
      ) : (
        <SaveCartItem
          variant={variant}
          formState={state}
          cartItemID={cartItemID}
        />
      )}
    </>
  );
};

export default ProductForm;
