import ProductForm from "@/components/product/product-form";
import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import type { Metadata, NextPage } from "next";
import { ProductImagePreview, SectionContainer, Prose } from "@/components";
import { ProductProvider } from "@/contexts/product-context";
import { Star, ChevronDown } from "lucide-react";
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
  {
    id: 10,
    author: "Andrew G",
    rating: 5,
    comment:
      "Really happy with my canvas. Looks great and came well packed. Took a few days but worth the wait.",
    date: "2025-11-11",
    verified: true,
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

const canvasFeatureCardConfig = [
  { key: "premiumCanvas", icon: "01" },
  { key: "archivalPrinting", icon: "02" },
  { key: "handStretched", icon: "03" },
  { key: "readyToHang", icon: "04" },
] as const;

const canvasComparisonRowKeys = [
  "material",
  "opacity",
  "technology",
  "frames",
  "origin",
  "guarantee",
] as const;

const canvasKeyDetailKeys = [
  "productionTime",
  "delivery",
  "builtToLast",
  "satisfaction",
  "localPickup",
  "shippingCost",
] as const;

const canvasFaqQuestionKeys = [
  "imageQuality",
  "depthDifference",
  "localPickupAvailable",
  "satisfaction",
  "durability",
  "deliveryTime",
  "multipleCanvases",
] as const;

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
  const qualityPageHref = `/${locale ?? "en"}/quality-guarantee`;
  const formatDate = (date: Date) =>
    date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
    });

  const today = new Date();
  const isCanvasProduct = params.handle === "canvas";
  const qualitySectionCopy = {
    title: t("canvasPage.qualitySection.title"),
    description: t("canvasPage.qualitySection.description"),
  };
  const featureCards = canvasFeatureCardConfig.map(({ key, icon }) => ({
    icon,
    title: t(`canvasPage.qualitySection.cards.${key}.title`),
    description: t(`canvasPage.qualitySection.cards.${key}.description`),
  }));
  const comparisonSectionCopy = {
    title: t("canvasPage.comparisonSection.title"),
    description: t("canvasPage.comparisonSection.description"),
    labels: {
      feature: t("canvasPage.comparisonSection.labels.feature"),
      ours: t("canvasPage.comparisonSection.labels.ours"),
      badge: t("canvasPage.comparisonSection.labels.badge"),
      theirs: t("canvasPage.comparisonSection.labels.theirs"),
    },
    footer: t("canvasPage.comparisonSection.footer"),
  };
  const comparisonRows = canvasComparisonRowKeys.map((key) => ({
    feature: t(`canvasPage.comparisonSection.rows.${key}.feature`),
    canvasPrintShop: t(`canvasPage.comparisonSection.rows.${key}.ours`),
    discount: t(`canvasPage.comparisonSection.rows.${key}.theirs`),
  }));
  const keyDetailsCopy = {
    eyebrow: t("canvasPage.keyDetails.eyebrow"),
    title: t("canvasPage.keyDetails.title"),
    description: t("canvasPage.keyDetails.description"),
  };
  const keyDetails = canvasKeyDetailKeys.map((key) => ({
    title: t(`canvasPage.keyDetails.items.${key}.title`),
    description: t(`canvasPage.keyDetails.items.${key}.description`),
  }));
  const faqIntro = t("canvasPage.faq.intro");
  const faqItems = canvasFaqQuestionKeys.map((key) => ({
    question: t(`faq.questions.${key}.question`),
    answer: t(`faq.questions.${key}.answer`),
  }));
  const reviewsSectionCopy = {
    title: t("canvasPage.reviewsSection.title"),
    subtitle: t("canvasPage.reviewsSection.subtitle"),
    ratingLabel: t("canvasPage.reviewsSection.ratingLabel", {
      count: reviews.length,
    }),
  };
  const gallerySectionCopy = {
    eyebrow: t("canvasPage.gallerySection.eyebrow"),
    title: t("canvasPage.gallerySection.title"),
    description: t("canvasPage.gallerySection.description"),
    cta: t("canvasPage.gallerySection.cta"),
    images: [
      {
        src: "/canvas-tools.jpeg",
        alt: t("canvasPage.gallerySection.images.tools"),
      },
      {
        src: "/canvas-making.jpeg",
        alt: t("canvasPage.gallerySection.images.craftsmanship"),
      },
      {
        src: "/canvas-in-living-room.jpeg",
        alt: t("canvasPage.gallerySection.images.livingRoom"),
      },
    ],
  };

  const ProductInformationPanel = ({
    showHeading = true,
    hideFaq = false,
    hideDelivery = false,
    hideDetails = false,
    hideQuality = false,
  }: {
    showHeading?: boolean;
    hideFaq?: boolean;
    hideDelivery?: boolean;
    hideDetails?: boolean;
    hideQuality?: boolean;
  }) => (
    <>
      {showHeading && (
        <h2 className="text-2xl font-semibold text-[#0F172A] mb-6">
          {t("productInformation")}
        </h2>
      )}
      <div className="space-y-4">
        <ProductDropdowns
          hideFaq={hideFaq}
          hideDelivery={hideDelivery}
          hideDetails={hideDetails}
          hideQuality={hideQuality}
        />
      </div>
    </>
  );

const ReviewsPanel = ({ showHeading = true }: { showHeading?: boolean }) => (
  <>
    {showHeading && (
      <h2 className="text-2xl font-bold text-secondary mb-6">
        {t("reviews.title")}
      </h2>
    )}

    {/* Rating summary */}
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
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
            const count = reviews.filter((r) => r.rating === stars).length;
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
                <span className="text-xs text-gray-500 w-8">{count}</span>
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
  </>
  );

  const HomepageGallerySection = () => (
    <section className="bg-[#F8FAFC] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-slate-500">
            {gallerySectionCopy.eyebrow}
          </p>
          <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-[#0F172A]">
            {gallerySectionCopy.title}
          </h3>
          <p className="mt-3 text-sm md:text-base text-slate-600">
            {gallerySectionCopy.description}
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gallerySectionCopy.images.map((image) => (
            <figure
              key={image.alt}
              className="space-y-3 rounded-[28px] bg-white/80 p-3 shadow-lg ring-1 ring-slate-100 backdrop-blur"
            >
              <div className="overflow-hidden rounded-[20px] bg-slate-100">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={640}
                  height={480}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 320px"
                  className="h-48 sm:h-56 w-full object-cover"
                />
              </div>
              <figcaption className="text-sm text-slate-600 text-center px-2">
                {image.alt}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href={qualityPageHref}
            className="inline-flex items-center justify-center rounded-full bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#111C3D]"
          >
            {gallerySectionCopy.cta}
          </Link>
        </div>
      </div>
    </section>
  );

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

        {/* Trusted By strip */}
        <section className="mt-10 px-4 sm:px-6">
          <div className="text-center space-y-4">
            <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-slate-500">
              {t("trustedBy")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pb-4">
              {trustedBy.map(({ src, alt }) => (
                <div key={alt} className="flex h-10 w-28 sm:h-12 sm:w-36 items-center justify-center">
                  <Image
                    src={src}
                    alt={alt}
                    width={180}
                    height={56}
                    className="h-full w-auto object-contain opacity-90"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {isCanvasProduct ? (
        <div className="w-full">
          {/* Canvas craft story */}
          <section className="relative isolate overflow-hidden bg-[#050E24] py-16 md:py-24 text-white">
            <div className="absolute inset-0">
              <div className="absolute -left-10 top-24 h-64 w-64 rounded-full bg-[#FF9933]/20 blur-3xl" />
              <div className="absolute -right-10 bottom-12 h-72 w-72 rounded-full bg-slate-500/20 blur-3xl" />
            </div>
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
                <div>
                  <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                    {qualitySectionCopy.title}
                  </h2>
                  <p className="mt-4 text-base md:text-lg text-white/70 max-w-3xl">
                    {qualitySectionCopy.description}
                  </p>
                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    {featureCards.map((feature) => (
                      <div
                        key={feature.title}
                        className="group flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 shadow-xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/30"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF9933]/20 text-[#FF9933] text-base font-semibold">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {feature.title}
                          </h3>
                          <p className="mt-1 text-sm text-white/70 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[32px] border border-white/15 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur">
                  <p className="text-sm text-white/70">
                    {reviewsSectionCopy.subtitle}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div>
                      <div className="text-4xl md:text-5xl font-semibold tracking-tight">
                        {averageRating.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <StarRating rating={averageRating} />
                    </div>
                  </div>
                  <div className="mt-8 grid gap-4">
                    {keyDetails.slice(0, 2).map((detail) => (
                      <div
                        key={`highlight-${detail.title}`}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                          {detail.title}
                        </p>
                        <p className="mt-2 text-base text-white">
                          {detail.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-8 text-xs text-white/50">
                    {comparisonSectionCopy.footer}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison */}
          <section className="bg-[#FFF7ED] py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="max-w-4xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#EA580C]">
                  {comparisonSectionCopy.labels.badge}
                </p>
                <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-[#0F172A]">
                  {comparisonSectionCopy.title}
                </h2>
                <p className="mt-3 text-base md:text-lg text-slate-700">
                  {comparisonSectionCopy.description}
                </p>
              </div>
              <div className="rounded-[32px] border border-[#FFD8B1] bg-white/90 shadow-[0_20px_60px_rgba(255,153,51,0.25)] overflow-hidden">
                <div className="hidden md:grid grid-cols-[0.9fr_1fr_1fr] text-sm font-semibold text-[#9A3412]">
                  <div className="px-6 py-4">{comparisonSectionCopy.labels.feature}</div>
                  <div className="px-6 py-4 border-x border-[#FFE7CF]">
                    <div>{comparisonSectionCopy.labels.ours}</div>
                    <div className="text-xs uppercase tracking-[0.3em] text-[#F97316]">
                      {comparisonSectionCopy.labels.badge}
                    </div>
                  </div>
                  <div className="px-6 py-4">{comparisonSectionCopy.labels.theirs}</div>
                </div>
                <div className="divide-y divide-[#FFE7CF]">
                  {comparisonRows.map((row) => (
                    <div
                      key={row.feature}
                      className="grid grid-cols-1 md:grid-cols-[0.9fr_1fr_1fr] text-sm md:text-base"
                    >
                      <div className="px-5 py-4 font-medium text-[#0F172A] bg-white">
                        <p className="md:hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
                          {comparisonSectionCopy.labels.feature}
                        </p>
                        {row.feature}
                      </div>
                      <div className="px-5 py-4 bg-[#FFF4E5] border-y md:border-y-0 border-[#FFE7CF] text-slate-800 md:border-x md:border-[#FFE7CF]">
                        <p className="md:hidden text-xs font-semibold uppercase tracking-[0.2em] text-[#F97316] mb-2">
                          {comparisonSectionCopy.labels.ours}
                        </p>
                        <div className="flex items-start gap-3">
                          <span aria-hidden="true" className="text-[#F97316] mt-1">
                            ✔
                          </span>
                          <p>{row.canvasPrintShop}</p>
                        </div>
                      </div>
                      <div className="px-5 py-4 bg-[#FFF9F3] text-slate-600">
                        <p className="md:hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
                          {comparisonSectionCopy.labels.theirs}
                        </p>
                        {row.discount}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 text-xs md:text-sm text-[#9A3412] bg-[#FFF4E5]">
                  <p>{comparisonSectionCopy.footer}</p>
                  <p className="uppercase tracking-[0.35em] font-semibold">
                    {t("trustedBy")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key details + FAQ */}
          <section className="bg-white py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[32px] border border-slate-200 bg-slate-50/70 p-6 sm:p-10 shadow-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FF9933]">
                    {keyDetailsCopy.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-[#0F172A]">
                    {keyDetailsCopy.title}
                  </h3>
                  <p className="mt-3 text-sm md:text-base text-slate-700 max-w-2xl">
                    {keyDetailsCopy.description}
                  </p>
                  <dl className="mt-8 grid gap-6 sm:grid-cols-2">
                    {keyDetails.map((detail) => (
                      <div
                        key={detail.title}
                        className="rounded-2xl bg-white p-4 shadow-sm border border-white"
                      >
                        <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {detail.title}
                        </dt>
                        <dd className="mt-2 text-base text-[#0F172A]">
                          {detail.description}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="rounded-[32px] border border-slate-100 bg-white shadow-xl p-4 sm:p-8">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl md:text-3xl font-semibold text-[#0F172A]">
                      {t("faq.title")}
                    </h3>
                    <p className="text-sm md:text-base text-slate-600">
                      {faqIntro}
                    </p>
                  </div>
                  <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-100">
                    {faqItems.map((faq) => (
                      <details
                        key={faq.question}
                        className="group open:bg-slate-50/60 transition"
                      >
                        <summary className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm md:text-base font-medium text-[#0F172A] [&::-webkit-details-marker]:hidden">
                          <span>{faq.question}</span>
                          <ChevronDown className="h-5 w-5 flex-shrink-0 text-[#FF9933] transition-transform duration-300 group-open:rotate-180" />
                        </summary>
                        <div className="px-5 pb-5 text-sm md:text-base text-slate-700">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <HomepageGallerySection />

          {/* Reviews */}
          <section id="reviews" className="relative isolate bg-[#020617] py-16 md:py-24 text-white">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] items-start">
                <div className="rounded-[32px] border border-white/15 bg-white/5 p-6 sm:p-10 shadow-2xl backdrop-blur">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
                    <Star className="h-4 w-4 text-[#FF9933] fill-[#FF9933]" />
                    {t("reviews.title")}
                  </div>
                  <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-white">
                    {reviewsSectionCopy.title}
                  </h2>
                  <p className="mt-3 text-sm md:text-base text-white/70">
                    {reviewsSectionCopy.subtitle}
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="text-5xl font-semibold">{averageRating.toFixed(1)}</div>
                    <div>
                      <StarRating rating={averageRating} />
                    </div>
                  </div>
                </div>
                <div className="rounded-[32px] bg-white shadow-2xl p-4 sm:p-8">
                  <ReviewsPanel showHeading={false} />
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <>
          <HomepageGallerySection />
          <div className="bg-slate-50 border-t border-slate-200 py-16 md:py-20">
            <div className="container mx-auto max-w-screen-2xl px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-slate-100">
                  <ReviewsPanel />
                </div>
                <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-slate-100">
                  <ProductInformationPanel />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </ProductProvider>
  );
};

export default ProductPage;
