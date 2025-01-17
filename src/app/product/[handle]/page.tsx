import Gallery from "@/components/product/product-gallery";
import { ProductProvider } from "@/contexts/product-context";
import ProductDescription from "@/components/product/product-description";
import { getProduct } from "@/lib/shopify";
import * as types from "@/lib/shopify/types";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { AddToCart } from "@/components/cart/add-to-cart";

interface Props {
  params: { handle: string };
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { handle } = await params
  const product = await getProduct(handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = true;

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: url
      ? {
        images: [
          {
            url,
            width,
            height,
            alt,
          },
        ],
      }
      : null,
  };
}

const ProductPage: React.FC<Props> = async ({
  params,
}) => {
  const { handle } = await params
  const product = await getProduct(handle)
  if (!product) return notFound();
  return (
    <ProductProvider>
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 lg:flex-row lg:gap-8 dark:border-neutral-800 dark:bg-black">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              <Gallery
                images={product.images.slice(0, 5).map((image: types.Image) => ({
                  src: image.url,
                  altText: image.altText,
                }))}
              />
            </Suspense>
          </div>
          <div className="basis-full lg:basis-2/6">
            <Suspense fallback={null}>
              <ProductDescription product={product} />
              <AddToCart product={product} />
            </Suspense>
          </div>
        </div>
      </div>
    </ProductProvider>
  );
}

export default ProductPage;
