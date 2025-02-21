import { ProductProvider } from "@/contexts/product-context";
import ProductForm from "@/components/product/product-form";
import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { Suspense, useEffect } from "react";
import type { Metadata, NextPage } from "next";
import { ProductImagePreview } from "@/components/product/product-image-preview";
import Prose from "@/components/prose";
import ImageUploader from "@/components/image-uploader";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const product = await getProduct(params?.handle ?? "");

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
              alt: alt || "",
            },
          ],
        }
      : null,
  };
};

const ProductPage: NextPage<Props> = async (props) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const product = await getProduct(params.handle);
  const cartItemID = searchParams?.["cartItemID"] as string | undefined;

  if (!product) return notFound();
  return (
    <ProductProvider>
      <div className="mx-auto max-w-screen-2xl pl-4">
        <div className="rounded-lg p-8 md:p-12 box-border border border-neutral-200 lg:flex lg:gap-12">
          <div className="basis-full lg:basis-4/6 mb-6 lg:mb-0 ">
            <Suspense fallback={<div className="aspect-square h-96 w-full" />}>
              <ProductImagePreview
                product={product}
                className="lg:sticky lg:top-28"
              />
            </Suspense>
          </div>
          <div className="basis-full lg:basis-2/6">
            <Suspense fallback={null}>
              <div className="mb-6 flex flex-col border-b pb-6">
                <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
              </div>
              {product.descriptionHtml ? (
                <Prose
                  className="mb-6 text-sm leading-light"
                  html={product.descriptionHtml}
                />
              ) : null}
              <ImageUploader className="mb-6" />
              <ProductForm product={product} cartItemID={cartItemID} />
            </Suspense>
          </div>
        </div>
      </div>
    </ProductProvider>
  );
};

export default ProductPage;
