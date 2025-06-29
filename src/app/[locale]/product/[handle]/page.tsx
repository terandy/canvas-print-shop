import ProductForm from "@/components/product/product-form";
import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata, NextPage } from "next";
import { ProductImagePreview, SectionContainer, Prose } from "@/components";
import { ProductProvider } from "@/contexts/product-context";
import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ProductDropdowns from "@/components/product/product-dropdowns";

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

// Reviews data
const reviews = [
  {
    id: 1,
    author: "lesproduitsfleurie",
    rating: 5,
    comment:
      "I highly recommend! Very satisfied with my labels! Great customer service, very fast. Thank you very much.",
  },
  {
    id: 2,
    author: "Andréanne Blackburn",
    rating: 5,
    comment:
      "I recommend 100% family business, attentive to our needs, with attention to detail",
  },
  {
    id: 3,
    author: "Mélissa Guérard",
    rating: 5,
    comment:
      "L'équipe est incroyable! Ils savent répondre à nos besoins tant pour le laminage que l'impression",
  },
  {
    id: 4,
    author: "Carrossier ProColor Lac St-Charles",
    rating: 5,
    comment: "Always quality work! Thank you for your excellent service!",
  },
  {
    id: 5,
    author: "Guy Tremblay",
    rating: 5,
    comment: "Very satisfied with the work accomplished.",
  },
  {
    id: 6,
    author: "France Paul",
    rating: 5,
    comment: "Very satisfied with the result and the service!",
  },
  {
    id: 7,
    author: "Renald Lafleur",
    rating: 5,
    comment: "Best place for imaging in Quebec.",
  },
  {
    id: 8,
    author: "France Bouchard",
    rating: 5,
    comment: "Always perfect!!!!",
  },
  {
    id: 9,
    author: "Arka",
    rating: 3,
    comment:
      "Contacted by email for a quote. I assume the project was not within the company's capabilities.",
  },
];

// Calculate average rating
const averageRating =
  reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

// Star Rating Component
const StarRating = ({
  rating,
  showNumber = false,
}: {
  rating: number;
  showNumber?: boolean;
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating)
              ? "fill-primary text-primary"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
      {showNumber && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({reviews.length} reviews)
        </span>
      )}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }: { review: (typeof reviews)[0] }) => {
  return (
    <div className="border-b border-gray-100 pb-6 mb-6 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-secondary">{review.author}</p>
          <StarRating rating={review.rating} />
        </div>
      </div>
      <p className="text-gray-600 mt-3">{review.comment}</p>
    </div>
  );
};

const ProductPage: NextPage<Props> = async (props: Props) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const product = await getProduct(params.handle);
  const cartItemID = searchParams?.["cartItemID"] as string | undefined;
  const t = await getTranslations("Product");

  if (!product) return notFound();

  return (
    <ProductProvider product={product} cartItemID={cartItemID ?? null}>
      <div className="container mx-auto max-w-screen-2xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-8 p-6 lg:p-8">
          {/* Image container - adapts for mobile/desktop */}
          <div
            className="lg:col-span-3 sticky top-0 lg:static z-10 lg:z-auto bg-white lg:bg-transparent pb-4 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0 z-30 pt-2 lg:pt-0"
            id="product-image-preview-container"
          >
            <Suspense fallback={<div className="aspect-square h-96 w-full" />}>
              <ProductImagePreview className="max-h-[40vh] lg:max-h-none lg:sticky lg:top-28" />
            </Suspense>
          </div>

          {/* Product details container */}
          <div className="lg:col-span-2 mt-4 lg:mt-0 relative z-20 lg:z-auto bg-white lg:bg-transparent">
            <Suspense fallback={null}>
              <div className="space-y-6 rounded-lg border border-gray/10 shadow-lg p-6">
                {/* Left-aligned title with star rating */}
                <div className="text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold text-secondary mb-2">
                    {product.title}
                  </h1>
                  <StarRating rating={averageRating} showNumber={true} />
                </div>

                {/* Product description */}
                <SectionContainer className="-mx-6 rounded-none">
                  {product.descriptionHtml && (
                    <Prose
                      className="text-sm leading-light"
                      html={product.descriptionHtml}
                    />
                  )}
                </SectionContainer>

                {/* Product form */}
                <ProductForm />

                {/* Dropdown sections */}
                <div className="mt-8 border-t border-gray-200">
                  <ProductDropdowns />
                </div>
              </div>
            </Suspense>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-secondary mb-8">
            {t("reviews.title")}
          </h2>
          <div className="grid gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </ProductProvider>
  );
};

export default ProductPage;
