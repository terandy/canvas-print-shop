"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { Product } from "@/lib/shopify/types";
import VariantSelector from "./product-variant-selector";
import React, { startTransition, useLayoutEffect } from "react";
import { AddToCart } from "../cart/add-to-cart";
import { SaveCartItem } from "../cart/save-cart-item";
import BorderStyleSelector from "./border-style-selector";
import DirectionSelector from "./direction-selector";
import { ProductState, useProduct, useUpdateURL } from "@/contexts/product-context";
import FrameSelector from "./frame-selector";

interface Props {
  product: Product;
  cartItemID?: string;
}
const ProductForm: React.FC<Props> = ({
  product,
  cartItemID,
}) => {
  const { state, updateOptions } = useProduct();
  const updateURL = useUpdateURL();

  useLayoutEffect(() => {
    startTransition(() => {
      const newState: ProductState = {};
      if (!state.borderStyle) newState.borderStyle = "wrapped";
      if (!state.direction) newState.direction = "landscape";
      product.options.forEach(opt => {
        const name = opt.name.toLowerCase()
        if (!state[name]) newState[name] = opt.values[0];
      });
      const productState = updateOptions(newState)
      updateURL(productState);

    })
  }, [])

  const frameOption = product.options.find(opt => opt.name.toLowerCase() === "frame")

  return <>
    <VariantSelector options={product.options} variants={product.variants} />
    <DirectionSelector />
    <BorderStyleSelector />
    {frameOption && <FrameSelector option={frameOption} options={product.options} variants={product.variants} />}
    {!cartItemID ? <AddToCart product={product} /> :
      <SaveCartItem product={product} cartItemID={cartItemID} />}
  </>;
};

export default ProductForm