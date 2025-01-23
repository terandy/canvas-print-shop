import { Product } from "@/lib/shopify/types";
import Price from "../price";
import VariantSelector from "./product-variant-selector";
import Prose from "../prose";
import React from "react";
import ImageUploader from "../image-uploader";
import { AddToCart } from "../cart/add-to-cart";

interface Props {
  product: Product;
}
const ProductDescription: React.FC<Props> = ({
  product
}) => {

  return <>
    <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
      <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
      <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
        <Price amount={product.priceRange.maxVariantPrice.amount} currencyCode={product.priceRange.maxVariantPrice.currencyCode} />
      </div>
    </div>
    {product.descriptionHtml ? <Prose className="mb-6 text-sm leading-light dark:text-white/[60%]" html={product.descriptionHtml} /> : null}
    <ImageUploader className="mb-6" />
    <VariantSelector options={product.options} variants={product.variants} />
    <AddToCart product={product} />
  </>;
};

export default ProductDescription