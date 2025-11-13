import ProductForm from "@/components/product/product-form";
import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Script from "next/script";
import type { Metadata, NextPage } from "next";
import { ProductImagePreview, SectionContainer, Prose } from "@/components";
import { ProductProvider } from "@/contexts/product-context";
import {
  Star,
  Clock,
  Truck,
  ShieldCheck,
  Smile,
  MapPin,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import ProductDropdowns from "@/components/product/product-dropdowns";
import { addBusinessDays } from "@/lib/utils/base";
import { getLocale } from "next-intl/server";
import type { LucideIcon } from "lucide-react";

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

const canvasFeatureCards = [
  {
    title: "Premium cotton-blend canvas",
    description:
      "We use a high-density cotton-blend canvas with up to 75% opacity. That means richer colour, cleaner whites and far less show-through than lightweight budget canvases.",
    icon: "01",
  },
  {
    title: "Archival-grade printing",
    description:
      "Your photo is printed with Canon UVgel technology for sharp detail, deep blacks and no odour. We guarantee it will not fade for 30+ years in typical home conditions.",
    icon: "02",
  },
  {
    title: "Hand-stretched in Quebec City",
    description:
      "Every canvas is printed, stretched and finished in our Quebec City studio on custom wooden stretcher bars, with tight tension and crisp, clean corners.",
    icon: "03",
  },
  {
    title: "Ready to hang, built to last",
    description:
      "Each canvas arrives ready to hang with hardware included, and is checked by our team before it leaves the workshop.",
    icon: "04",
  },
];

const canvasKeyDetails: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Production time",
    description:
      "We typically need 2 – 4 days to print, stretch and pack your canvas before dispatch.",
    icon: Clock,
  },
  {
    title: "Delivery",
    description:
      "Add shipping transit time on top. You will see options and estimates at checkout.",
    icon: Truck,
  },
  {
    title: "Built to last",
    description:
      "Printed with Canon UVgel technology and guaranteed not to fade for over 30 years.",
    icon: ShieldCheck,
  },
  {
    title: "Satisfaction guarantee",
    description:
      "30-day satisfaction guarantee. If you are not happy, we will make it right.",
    icon: Smile,
  },
  {
    title: "Local pickup",
    description:
      "Free pickup from our Quebec City location during business hours.",
    icon: MapPin,
  },
  {
    title: "Shipping cost",
    description:
      "Available at checkout (FREE shipping on orders over $150).",
    icon: DollarSign,
  },
];

const canvasFaqItems = [
  {
    question: "How do I know if my image quality is good enough?",
    answer:
      "Our system automatically checks your image resolution and shows a quality indicator (Poor, Normal or Perfect) when you select a canvas size. We recommend 'Perfect' quality for the best results.",
  },
  {
    question: "What's the difference between Regular and Gallery depth?",
    answer:
      "Regular depth (0.75 inches) is our standard option, while Gallery depth (1.5 inches) creates a more dramatic, museum-like appearance with deeper sides.",
  },
  {
    question: "Do you offer local pickup?",
    answer:
      "Yes! We offer free local pickup at our Quebec City location during business hours (Monday-Friday, 9am-5pm EST). You'll receive an email when your order is ready.",
  },
  {
    question: "What if I'm not satisfied with my canvas?",
    answer:
      "We offer a 30-day satisfaction guarantee. If you're not completely happy with your canvas, we'll work with you to make it right or provide a full refund.",
  },
  {
    question: "How long will my canvas last?",
    answer:
      "Our canvases are printed with UVgel technology and guaranteed not to fade for over 30 years. They're also scratch and water-resistant for long-lasting beauty.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "We typically need 2 - 4 days to produce, package and dispatch your canvas. Please allow additional transit time based on the shipping option you choose.",
  },
  {
    question: "Can I order multiple canvases of the same image?",
    answer:
      "Absolutely! You can create multiple canvas designs with different sizes and framing options from the same image.",
  },
];

const canvasComparisonRows = [
  {
    feature: "Canvas material",
    canvasPrintShop: "Premium cotton-blend canvas with high opacity.",
    discount: "Lightweight polyester canvas with more show-through.",
  },
  {
    feature: "Canvas density & opacity",
    canvasPrintShop: "Up to 75% opacity for rich colour and clean whites.",
    discount: "Lower opacity, more visible texture and show-through on light walls.",
  },
  {
    feature: "Print technology",
    canvasPrintShop: "Canon UVgel printing for sharp detail and long-lasting colour.",
    discount: "Standard dye or solvent printing, more prone to fading.",
  },
  {
    feature: "Frames and build",
    canvasPrintShop:
      "Custom stretcher bars, hand-stretched and inspected in our Quebec City studio.",
    discount: "Generic frames, often machine-stretched with less quality control.",
  },
  {
    feature: "Where it's made",
    canvasPrintShop: "Printed and finished in Canada.",
    discount: "Often produced in high-volume overseas facilities.",
  },
  {
    feature: "Guarantee",
    canvasPrintShop: "30-year print quality guarantee and 30-day satisfaction guarantee.",
    discount: "Shorter warranties and more limited support.",
  },
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
  const isCanvasProduct = params.handle === "canvas";

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
          <div className="rounded-2xl border border-gray/10 bg-white shadow-sm px-4 sm:px-6 py-6">
            <p className="text-center text-xs sm:text-sm tracking-[0.3em] uppercase text-gray-500">
              {t("trustedBy")}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2">
              {trustedBy.map(({ src, alt }) => (
                <div
                  key={alt}
                  className="flex h-10 w-28 items-center justify-center sm:h-14 sm:w-40"
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={180}
                    height={56}
                    className="h-full w-auto object-contain opacity-80 transition hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {isCanvasProduct ? (
        <div className="w-full">
          {/* Canvas quality + comparison story */}
          <section className="w-full bg-gradient-to-b from-[#0F172A] via-[#111827] to-[#0F172A] py-16 md:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-semibold text-white">
                  Why our canvas feels different
                </h2>
                <p className="mt-4 text-base md:text-lg text-slate-100/80 max-w-3xl">
                  Most online canvas prints look similar on screen, but feel very
                  different in real life. We focus on the materials and print
                  process so your canvas actually looks and feels premium when
                  it&apos;s on the wall.
                </p>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {canvasFeatureCards.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-7 shadow-xl backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF9933]/15 text-[#FF9933] text-sm font-semibold">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-slate-100/80 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="w-full bg-[#FFF7ED] py-16 md:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-semibold text-[#0F172A]">
                  Canvas Print Shop vs cheap canvas prints
                </h2>
                <p className="mt-4 text-base md:text-lg text-slate-700 max-w-3xl">
                  Not all canvases are made the same. Here&apos;s how our canvases
                  compare to the typical discount canvas prints you see online.
                </p>
              </div>
              <div className="mt-8 rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
                <div className="hidden md:grid grid-cols-3 text-sm md:text-base font-semibold">
                  <div className="bg-white px-4 py-4 text-slate-800">Feature</div>
                  <div className="bg-[#FFF4E5] px-4 py-4 text-[#0F172A] flex flex-col gap-1 border-x border-slate-100">
                    <span>Canvas Print Shop</span>
                    <span className="text-xs uppercase tracking-wide text-[#FF9933] font-semibold">
                      Best choice
                    </span>
                  </div>
                  <div className="bg-slate-50 px-4 py-4 text-slate-700">
                    Typical discount canvas prints
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {canvasComparisonRows.map((row) => (
                    <div
                      key={row.feature}
                      className="grid grid-cols-1 md:grid-cols-3 text-sm md:text-base"
                    >
                      <div className="px-4 py-4 md:py-3 font-medium text-[#0F172A] bg-white md:border-r md:border-slate-100">
                        <p className="md:hidden text-xs font-semibold tracking-wide text-slate-500 uppercase mb-1">
                          Feature
                        </p>
                        {row.feature}
                      </div>
                      <div className="px-4 py-4 md:py-3 bg-[#FFF4E5] text-slate-800 md:border-r md:border-slate-100">
                        <p className="md:hidden text-xs font-semibold tracking-wide text-[#FF9933] uppercase mb-1">
                          Canvas Print Shop
                        </p>
                        <div className="flex items-start gap-2">
                          <span aria-hidden="true" className="mt-1 text-[#FF9933]">
                            ✔
                          </span>
                          <p className="flex-1">{row.canvasPrintShop}</p>
                        </div>
                      </div>
                      <div className="px-4 py-4 md:py-3 bg-slate-50 text-slate-600">
                        <p className="md:hidden text-xs font-semibold tracking-wide text-slate-500 uppercase mb-1">
                          Typical discount canvas prints
                        </p>
                        {row.discount}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs md:text-sm text-slate-500 px-4 py-3 border-t border-slate-100 text-right">
                  Designed, printed and finished in Canada, backed by a 30-year print
                  quality guarantee.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-[#FFF7ED] py-16 md:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-[#FF9933]/20 bg-white shadow-xl p-6 sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#FF9933]">
                  Product information
                </p>
                <h3 className="mt-2 text-2xl md:text-3xl font-semibold text-[#0F172A]">
                  Key details at a glance
                </h3>
                <p className="mt-3 text-sm md:text-base text-slate-700">
                  Everything we do is focused on longevity, ease of hanging and getting
                  your canvas on the wall quickly.
                </p>
                <dl className="mt-8 grid gap-6 sm:grid-cols-2">
                  {canvasKeyDetails.map((detail) => (
                    <div key={detail.title}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {detail.title}
                      </dt>
                      <dd className="mt-1 text-base text-[#0F172A]">
                        {detail.description}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="mt-12">
                <h3 className="text-2xl md:text-3xl font-semibold text-[#0F172A]">
                  Frequently Asked Questions
                </h3>
                <p className="mt-2 text-sm md:text-base text-slate-700 max-w-2xl">
                  Answers to the most common questions about our canvas prints, image
                  quality and delivery.
                </p>
                <div className="mt-6 divide-y divide-slate-200 rounded-2xl bg-white shadow-lg border border-slate-100">
                  {canvasFaqItems.map((faq) => (
                    <details key={faq.question} className="group">
                      <summary className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left [&::-webkit-details-marker]:hidden">
                        <span className="text-sm md:text-base font-medium text-[#0F172A]">
                          {faq.question}
                        </span>
                        <ChevronDown className="h-5 w-5 text-[#FF9933] transition-transform duration-300 group-open:rotate-180" />
                      </summary>
                      <div className="px-5 pb-4 text-sm md:text-base text-slate-700">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="reviews" className="bg-white py-16 md:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[#0F172A]">
                    Customer reviews
                  </h2>
                  <p className="mt-1 text-sm md:text-base text-slate-600">
                    See what people think of their Canvas Print Shop canvases.
                  </p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-full bg-[#FFF4E5] px-4 py-2 border border-[#FF9933]/30">
                  <Star className="h-5 w-5 text-[#FF9933] fill-[#FF9933]" />
                  <span className="text-lg font-semibold text-[#0F172A]">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-slate-700">
                    Based on {reviews.length} reviews
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:p-6 shadow-inner">
                <ReviewsPanel showHeading={false} />
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="container mx-auto max-w-screen-2xl px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ReviewsPanel />
            </div>
            <div>
              <ProductInformationPanel />
            </div>
          </div>
        </div>
      )}
    </ProductProvider>
  );
};

export default ProductPage;
