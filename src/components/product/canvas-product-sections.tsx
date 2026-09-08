import Image from "next/image";
import { Check, ChevronDown, ShieldCheck, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  BUSINESS_DATA,
  SHOP_REVIEWS,
  type ShopReview,
} from "@/lib/business-data";
import { getProductPageContent } from "@/lib/product-page-content";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-dark";
const eyebrow =
  "text-[10px] font-medium uppercase tracking-[0.18em] text-primary-dark";
const heading =
  "font-serif text-4xl leading-[1.08] tracking-[-0.035em] sm:text-5xl";
const trustedBy = [
  { src: "/starbucks-logo.png", name: "Starbucks" },
  { src: "/cnesst-logo.png", name: "CNESST" },
  { src: "/christyna-merette-logo.png", name: "Christyna Mérette" },
  { src: "/inkpicx-logo.avif", name: "Créations Inkpicx" },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 gap-0.5">
      {[0, 1, 2, 3, 4].map((index) => (
        <span key={index} className="relative h-4 w-4">
          <Star
            className="h-4 w-4 fill-secondary/10 text-secondary/10"
            strokeWidth={1}
          />
          <span
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{
              width: `${Math.max(0, Math.min(1, rating - index)) * 100}%`,
            }}
          >
            <Star
              className="h-4 w-4 max-w-none fill-primary-dark text-primary-dark"
              strokeWidth={1}
            />
          </span>
        </span>
      ))}
    </span>
  );
}

export async function CanvasProductRating({ locale }: { locale: string }) {
  const t = await getTranslations("Product");
  const rating = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(BUSINESS_DATA.reviews.ratingValue);
  return (
    <a
      href="#reviews"
      className={`mt-3 flex min-h-10 w-fit flex-wrap items-center gap-x-3 gap-y-1 rounded-sm text-xs text-secondary transition-colors hover:text-primary-dark ${focus}`}
    >
      <RatingStars rating={BUSINESS_DATA.reviews.ratingValue} />
      <span className="underline decoration-secondary/25 underline-offset-4">
        {t("averageRating", { rating, count: SHOP_REVIEWS.length })}
      </span>
    </a>
  );
}

export async function CanvasTrustedBy() {
  const t = await getTranslations("Product");
  return (
    <section
      aria-labelledby="canvas-trusted-title"
      className="border-t border-secondary/10 bg-[#FCFBF8]"
    >
      <div className="mx-auto grid max-w-[1360px] items-center gap-7 px-6 py-10 sm:px-10 lg:grid-cols-[160px_1fr] lg:gap-12 lg:py-12">
        <h2
          id="canvas-trusted-title"
          className={`${eyebrow} text-center lg:text-left`}
        >
          {t("trustedBy")}
        </h2>
        <ul className="grid grid-cols-2 items-center gap-x-10 gap-y-7 sm:grid-cols-4 sm:gap-x-12">
          {trustedBy.map((brand) => (
            <li
              key={brand.name}
              className="flex h-14 items-center justify-center"
            >
              <Image
                src={brand.src}
                alt={brand.name}
                width={180}
                height={64}
                sizes="(min-width: 640px) 180px, 130px"
                className="max-h-14 w-auto max-w-full object-contain mix-blend-multiply"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export async function CanvasComparison() {
  const t = await getTranslations("Product.canvasPage.comparisonSection");
  const studio = await getTranslations("Product.studio.comparison");
  const rows = getProductPageContent("canvas")?.comparisonRows ?? [];
  return (
    <section
      aria-labelledby="canvas-comparison-title"
      className="border-b border-secondary/10 bg-[#F3F1EB]"
    >
      <div className="mx-auto max-w-[1360px] px-6 py-16 sm:px-10 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className={eyebrow}>{studio("eyebrow")}</p>
            <h2
              id="canvas-comparison-title"
              className={`mt-4 max-w-xl ${heading}`}
            >
              {studio("title")}{" "}
              <span className="italic text-primary-dark">
                {studio("accent")}
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-gray">
            {t("description")}
          </p>
        </div>
        <div className="overflow-hidden rounded-sm border border-secondary/15 bg-[#FCFBF8]">
          <table className="block w-full border-collapse text-left md:table">
            <caption className="sr-only">{t("title")}</caption>
            <thead className="sr-only bg-secondary text-[#FCFBF8] md:not-sr-only md:table-header-group">
              <tr>
                <th
                  scope="col"
                  className="w-[24%] px-6 py-7 text-[10px] font-medium uppercase tracking-[0.16em] text-white/60"
                >
                  {t("labels.feature")}
                </th>
                <th
                  scope="col"
                  className="w-[38%] border-x border-white/15 bg-[#33281F] px-6 py-7"
                >
                  <span className="block text-[9px] font-medium uppercase tracking-[0.16em] text-[#D9AE87]">
                    {t("labels.badge")}
                  </span>
                  <span className="mt-2 block font-serif text-2xl font-normal tracking-[-0.025em]">
                    {t("labels.ours")}
                  </span>
                </th>
                <th
                  scope="col"
                  className="w-[38%] px-6 py-7 text-sm font-medium text-white/80"
                >
                  {t("labels.theirs")}
                </th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {rows.map((key, index) => (
                <tr
                  key={key}
                  className="grid grid-cols-2 border-t border-secondary/15 first:border-t-0 md:table-row"
                >
                  <th
                    scope="row"
                    className="col-span-2 flex items-baseline gap-3 bg-[#F3F1EB] px-4 py-4 text-xs font-medium leading-6 md:table-cell md:bg-transparent md:px-6 md:py-6"
                  >
                    <span
                      aria-hidden="true"
                      className="font-serif text-base italic text-primary-dark md:mr-3"
                    >
                      0{index + 1}
                    </span>
                    {t(`rows.${key}.feature`)}
                  </th>
                  <td className="border-r border-secondary/10 bg-[#EDE6DA]/65 px-4 py-5 align-top md:border-x md:px-6 md:py-6">
                    <span
                      aria-hidden="true"
                      className="mb-3 block text-[10px] font-medium leading-5 text-primary-dark md:hidden"
                    >
                      {t("labels.ours")}
                    </span>
                    <div className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 hidden h-4 w-4 shrink-0 text-primary-dark sm:block"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      <span className="text-xs leading-6 text-secondary sm:text-sm">
                        {t(`rows.${key}.ours`)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5 align-top md:px-6 md:py-6">
                    <span
                      aria-hidden="true"
                      className="mb-3 block text-[10px] font-medium leading-5 text-gray md:hidden"
                    >
                      {t("labels.theirs")}
                    </span>
                    <span className="text-xs leading-6 text-gray sm:text-sm">
                      {t(`rows.${key}.theirs`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="flex items-start gap-3 border-t border-secondary/15 bg-[#FCFBF8] px-5 py-5 text-xs leading-6 text-gray md:items-center md:px-6">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-primary-dark md:mt-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            {t("footer")}
          </p>
        </div>
      </div>
    </section>
  );
}

async function ReviewCard({
  review,
  locale,
}: {
  review: ShopReview;
  locale: string;
}) {
  const t = await getTranslations("Product");
  const studio = await getTranslations("Product.studio.reviews");
  const formattedDate = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${review.date}T12:00:00Z`));
  return (
    <article className="flex h-full flex-col border-t border-secondary/25 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          <RatingStars rating={review.rating} />
          <span className="sr-only">
            {studio("stars", { rating: review.rating })}
          </span>
        </span>
        <time dateTime={review.date} className="text-[10px] text-gray">
          {formattedDate}
        </time>
      </div>
      <blockquote className="mb-7 mt-5 flex-1 font-serif text-xl leading-[1.55] tracking-[-0.01em] text-secondary">
        {review.comment}
      </blockquote>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-secondary/15 bg-[#F3F1EB] font-serif text-sm text-primary-dark"
        >
          {review.author.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="break-words text-xs font-medium leading-5">
            {review.author}
          </p>
          {review.verified && (
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-gray">
              <Check className="h-3 w-3 text-primary-dark" aria-hidden="true" />
              {t("verified")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export async function CanvasReviews({ locale }: { locale: string }) {
  const t = await getTranslations("Product");
  const studio = await getTranslations("Product.studio.reviews");
  const reviews = [...SHOP_REVIEWS].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const rating = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(BUSINESS_DATA.reviews.ratingValue);
  return (
    <section
      id="reviews"
      aria-labelledby="canvas-reviews-title"
      className="scroll-mt-6 border-b border-secondary/10 bg-[#FCFBF8]"
    >
      <div className="mx-auto max-w-[1360px] px-6 py-16 sm:px-10 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className={eyebrow}>{studio("eyebrow")}</p>
            <h2 id="canvas-reviews-title" className={`mt-4 ${heading}`}>
              {t("reviews.title")}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-gray">
              {studio("description")}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <p className="font-serif text-6xl leading-none tracking-[-0.05em]">
              {rating}
              <span className="ml-1 text-2xl text-gray">/5</span>
            </p>
            <div>
              <RatingStars rating={BUSINESS_DATA.reviews.ratingValue} />
              <p className="mt-2 text-xs text-gray">
                {t("reviewsCount", { count: reviews.length })}
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-9 md:grid-cols-3 md:gap-7">
          {reviews.slice(0, 3).map((review) => (
            <ReviewCard key={review.id} review={review} locale={locale} />
          ))}
        </div>
        {reviews.length > 3 && (
          <details className="group mt-10">
            <summary
              className={`mx-auto flex min-h-12 w-fit cursor-pointer list-none items-center justify-center gap-5 rounded-full border border-secondary/25 px-6 py-3 text-xs font-medium transition-colors hover:border-primary-dark hover:text-primary-dark [&::-webkit-details-marker]:hidden ${focus}`}
            >
              <span className="group-open:hidden">
                {studio("showAll", { count: reviews.length })}
              </span>
              <span className="hidden group-open:inline">
                {studio("showLess")}
              </span>
              <ChevronDown
                className="h-4 w-4 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="mt-10 grid gap-x-7 gap-y-10 md:grid-cols-3">
              {reviews.slice(3).map((review) => (
                <ReviewCard key={review.id} review={review} locale={locale} />
              ))}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}
