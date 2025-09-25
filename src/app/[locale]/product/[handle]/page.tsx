import ProductForm from "@/components/product/product-form";
import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Script from "next/script";
import type { Metadata, NextPage } from "next";
import { ProductImagePreview, SectionContainer, Prose } from "@/components";
import { ProductProvider } from "@/contexts/product-context";
import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ProductDropdowns from "@/components/product/product-dropdowns";
import { addBusinessDays } from "@/lib/utils/base";
import { getLocale } from "next-intl/server";

/**
 * Page Props
 */
export type Props = {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Metadata generation
 */
export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const params = await props.params;
  const product = await getProduct(params?.handle ?? "");
  const locale = await getLocale();

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = true;
  const defaultTitle = locale?.startsWith("fr")
    ? "Toiles sur mesure | Fabrication canadienne"
    : "Custom Canvas Prints | Made In Canada";

  return {
    title: product.seo.title || defaultTitle,
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

/**
 * Static reviews data – replace with dynamic data when available
 */
const reviews = [
  {
    id: 1,
    author: "lesproduitsfleurie",
    rating: 5,
    comment:
      "I highly recommend! Very satisfied with my labels! Great customer service, very fast. Thank you very much.",
    date: "2024-12-15",
    verified: true,
  },
  {
    id: 2,
    author: "Andréanne Blackburn",
    rating: 5,
    comment:
      "I recommend 100% family business, attentive to our needs, with attention to detail",
    date: "2024-12-10",
    verified: true,
  },
  {
    id: 3,
    author: "Mélissa Guérard",
    rating: 5,
    comment:
      "L'équipe est incroyable! Ils savent répondre à nos besoins tant pour le laminage que l'impression",
    date: "2024-12-08",
    verified: true,
  },
  {
    id: 4,
    author: "Carrossier ProColor Lac St-Charles",
    rating: 5,
    comment: "Always quality work! Thank you for your excellent service!",
    date: "2024-12-05",
    verified: true,
  },
  {
    id: 5,
    author: "Guy Tremblay",
    rating: 5,
    comment: "Very satisfied with the work accomplished.",
    date: "2024-12-01",
    verified: true,
  },
  {
    id: 6,
    author: "France Paul",
    rating: 5,
    comment: "Very satisfied with the result and the service!",
    date: "2024-11-28",
    verified: true,
  },
  {
    id: 7,
    author: "Renald Lafleur",
    rating: 5,
    comment: "Best place for imaging in Quebec.",
    date: "2024-11-25",
    verified: true,
  },
  {
    id: 8,
    author: "France Bouchard",
    rating: 5,
    comment: "Always perfect!!!!",
    date: "2024-11-20",
    verified: true,
  },
  {
    id: 9,
    author: "Arka",
    rating: 3,
    comment:
      "Contacted by email for a quote. I assume the project was not within the company's capabilities.",
    date: "2024-11-18",
    verified: false,
  },
];

const trustedBy = [
  { src: "/Starbucks Logo for website.png", alt: "Starbucks logo" },
  { src: "/CNESST Logo for site.png", alt: "CNESST logo" },
  {
    src: "/Christyna Merette Logo.png",
    alt: "Christyna Mérette logo",
  },
  { src: "/Inkpicx Logo for website.avif", alt: "Créations Inkpicx logo" },
];

/**
 * Average rating helper
 */
const averageRating =
  reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

/**
 * Star rating component
 */
const StarRating = async ({
  rating,
  showNumber = false,
  reviewCount,
}: {
  rating: number;
  showNumber?: boolean;
  reviewCount?: number;
}) => {
  const t = await getTranslations("Product");

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
      {showNumber && t && reviewCount && (
        <span className="ml-2 text-sm text-gray-600">
          {t("averageRating", {
            rating: rating.toFixed(1),
            count: reviewCount,
          })}
        </span>
      )}
    </div>
  );
};

/**
 * Individual review card
 */
const ReviewCard = async ({ review }: { review: (typeof reviews)[0] }) => {
  const t = await getTranslations("Product");

  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-secondary">{review.author}</p>
            {review.verified && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {t("verified")}
              </span>
            )}
          </div>
          <StarRating rating={review.rating} />
        </div>

        <span className="text-sm text-gray-500">{review.date}</span>
      </div>
      <p className="text-gray-600 mt-2">{review.comment}</p>
    </div>
  );
};

const ProductPage: NextPage<Props> = async (props: Props) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const product = await getProduct(params.handle);
  const cartItemID = searchParams?.["cartItemID"] as string | undefined;
  const t = await getTranslations("Product");
  const locale = await getLocale();
  const formatDate = (date: Date) =>
    date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
    });

  const today = new Date();

  if (!product) return notFound();

  return (
    <ProductProvider product={product} cartItemID={cartItemID ?? null}>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=AW-17600505431"
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17600505431');
        `}
      </Script>
      <div className="container mx-auto max-w-screen-2xl lg:px-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-8 lg:p-8">
          {/* Image container - adapts for mobile/desktop with sticky functionality */}
          <div
            className="lg:col-span-3 sticky top-0 lg:static z-10 lg:z-auto bg-white lg:bg-transparent pb-4 lg:pb-0 px-6 lg:mx-0 lg:px-0 z-30 pt-2 lg:pt-0"
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
                {/* Title and rating */}
                <div className="text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold text-secondary mb-2">
                    {product.title}
                  </h1>
                  <StarRating
                    rating={averageRating}
                    showNumber
                    reviewCount={reviews.length}
                  />

                  {/* Delivery date estimate */}
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      📦 {t("delivery.getItBy")}{" "}
                      <strong>
                        {`${formatDate(addBusinessDays(today, 5))} - ${formatDate(addBusinessDays(today, 10))}`}
                      </strong>{" "}
                      {t("delivery.ifOrderToday")}
                    </p>
                  </div>
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
              </div>
            </Suspense>
          </div>
        </div>

        {/* Reviews + Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-screen-xl mx-auto px-6 py-12">
          {/* Reviews column (left) */}
          <div>
            <h2 className="text-2xl font-bold text-secondary mb-2">
              {t("trustedBy")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center justify-items-center mb-7">
              {trustedBy.map(({ src, alt }) => (
                <div
                  key={alt}
                  className="h-16 flex items-center justify-center"
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={200}
                    height={56}
                    className="h-14 w-auto object-contain grayscale hover:grayscale-0 transition"
                  />
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-6">
              {t("reviews.title")}
            </h2>

            {/* Rating summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">
                    {averageRating.toFixed(1)}
                  </div>
                  <StarRating rating={averageRating} />
                  <div className="text-sm text-gray-500 mt-1">
                    {t("averageRating", {
                      rating: "",
                      count: reviews.length,
                    }).replace(/^[0-9.]+ /, "")}
                  </div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter(
                      (r) => r.rating === stars
                    ).length;
                    const percentage = (count / reviews.length) * 100;
                    return (
                      <div key={stars} className="flex items-center gap-2 mb-1">
                        <span className="text-sm w-8">{stars}</span>
                        <Star className="w-3 h-3 fill-gray-300 text-gray-300" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Individual reviews */}
            <div className="space-y-4 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>

          {/* Product Details column (right) */}
          <div>
            <h2 className="text-2xl font-bold text-secondary mb-6">
              {t("productInformation")}
            </h2>
            <div className="space-y-4">
              <ProductDropdowns />
            </div>
          </div>
        </div>
      </div>
    </ProductProvider>
  );
};

export default ProductPage;
