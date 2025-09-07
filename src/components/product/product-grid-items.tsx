import { Product } from "@/lib/shopify/types";
import Grid from "../grid/grid";
import Link from "next/link";
import GridTileImage from "../grid/grid-tile-image";
import React from "react";

interface Props {
  products: Product[];
}

const ProductGridItems: React.FC<Props> = ({ products }) => {
  return (
    <>
      {products.map((product) => (
        <Grid.Item key={product.handle} className="animate-fadeIn">
          <Link
            href={`/product/${product.handle}`}
            className="relative inline-block h-full w-full"
            prefetch={true}
          >
            <GridTileImage
              alt={product.title ?? "product"}
              label={{
                title: product.title,
                amount: product.priceRange.minVariantPrice.amount,
                currencyCode: product.priceRange.maxVariantPrice.currencyCode,
              }}
              src={product.featuredImage?.url}
              fill
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </Link>
        </Grid.Item>
      ))}
    </>
  );
};

export default ProductGridItems;
