"use client";

import { Product } from "@/lib/shopify/types";
import VariantSelector from "./product-variant-selector";
import React from "react";
import { AddToCart } from "../cart/add-to-cart";
import { SaveCartItem } from "../cart/save-cart-item";
import BorderStyleSelector from "./border-style-selector";
import DirectionSelector from "./direction-selector";

interface Props {
  product: Product;
  cartItemID?: string;
}
const ProductForm: React.FC<Props> = ({
  product,
  cartItemID,
}) => {

  return <>
    <VariantSelector options={product.options} variants={product.variants} />
    <DirectionSelector />
    <BorderStyleSelector />
    {!cartItemID ? <AddToCart product={product} /> :
      <SaveCartItem product={product} cartItemID={cartItemID} />}
  </>;
};

export default ProductForm