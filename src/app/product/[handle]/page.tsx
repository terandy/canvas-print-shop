import { ProductProvider } from "@/contexts/product-context";
import ProductForm from "@/components/product/product-form";
import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata, NextPage } from "next";
import {
  ProductImagePreview,
  SectionContainer,
  PageHeader,
  ImageUploader,
  Prose,
} from "@/components";

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
      <div className="container mx-auto max-w-screen-2xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-8 p-6 lg:p-8">
          <div className="lg:col-span-3" id="product-image-preview-container">
            <Suspense fallback={<div className="aspect-square h-96 w-full" />}>
              <ProductImagePreview
                product={product}
                className="lg:sticky lg:top-28"
              />
            </Suspense>
          </div>

          <div className="lg:col-span-2 mt-8 lg:mt-0">
            <Suspense fallback={null}>
              <div className="space-y-6 rounded-lg  border border-gray/10 shadow-lg p-6">
                <PageHeader>{product.title}</PageHeader>
                <SectionContainer className="-mx-6 rounded-none">
                  {product.descriptionHtml && (
                    <Prose
                      className="text-sm leading-light"
                      html={product.descriptionHtml}
                    />
                  )}
                </SectionContainer>
                <ImageUploader />
                <ProductForm product={product} cartItemID={cartItemID} />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </ProductProvider>
  );
};

export default ProductPage;
