"use client";

import { Product } from "@/lib/shopify/types";
import VariantSelector from "./product-variant-selector";
import Prose from "../prose";
import React from "react";
import ImageUploader from "../image-uploader";
import { AddToCart } from "../cart/add-to-cart";
import { SaveCartItem } from "../cart/save-cart-item";
import ImageFile from "./image-file";
import BorderStyleSelector from "./border-style-selector";
import DirectionSelector from "./direction-selector";

interface Props {
  product: Product;
  cartItemID?: string;
  imgURL?: string
}
const ProductForm: React.FC<Props> = ({
  product,
  cartItemID,
  imgURL
}) => {

  return <>
    {imgURL ? <ImageFile imgURL={imgURL} /> : <ImageUploader className="mb-6" />}
    <VariantSelector options={product.options} variants={product.variants} />
    <DirectionSelector />
    <BorderStyleSelector />
    {!cartItemID ? <AddToCart product={product} /> :
      <SaveCartItem product={product} cartItemID={cartItemID} />}
  </>;
};

export default ProductForm