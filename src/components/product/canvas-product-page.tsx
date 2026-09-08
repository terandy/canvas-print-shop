import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Frame,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Product } from "@/types/product";
import { BUSINESS_DATA } from "@/lib/business-data";
import { getDeliveryEstimate } from "@/lib/delivery";
import CanvasConfigurator from "./canvas-configurator";
import CanvasStudioPreview from "./canvas-studio-preview";
import {
  CanvasComparison,
  CanvasProductRating,
  CanvasReviews,
  CanvasTrustedBy,
} from "./canvas-product-sections";

const eyebrow =
  "text-[10px] font-medium uppercase tracking-[0.18em] text-primary-dark";
const heading =
  "font-serif text-4xl leading-[1.08] tracking-[-0.035em] sm:text-5xl";
const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-dark";
const link = `inline-flex min-h-11 items-center gap-4 text-[13px] font-medium transition-colors hover:text-primary-dark ${focus}`;

export default async function CanvasProductPage({
  product,
  locale,
}: {
  product: Product;
  locale: string;
}) {
  const t = await getTranslations("Product.studio");
  const p = await getTranslations("Product");
  const breadcrumb = await getTranslations("LandingPages.common.breadcrumb");
  const estimate = getDeliveryEstimate();
  const date = (value: Date) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
      value
    );
  const years = BUSINESS_DATA.product.printQualityGuaranteeYears;
  const days = BUSINESS_DATA.product.satisfactionReturnDays;
  const faqs = [
    "imageQuality",
    "depthDifference",
    "localPickupAvailable",
    "satisfaction",
    "durability",
    "deliveryTime",
    "multipleCanvases",
  ];

  return (
    <main className="bg-[#FCFBF8] text-secondary">
      <div className="mx-auto max-w-[1440px] px-6 pb-14 pt-6 sm:px-10 lg:pb-20 lg:pt-8">
        <nav
          aria-label={t("breadcrumb")}
          className="mb-7 flex flex-wrap items-center gap-3 text-[11px] text-gray lg:mb-10"
        >
          <Link
            href={`/${locale}`}
            className={`hover:text-primary-dark ${focus}`}
          >
            {breadcrumb("home")}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`/${locale}/shop`}
            className={`hover:text-primary-dark ${focus}`}
          >
            {breadcrumb("canvasPrints")}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-secondary">
            {product.title}
          </span>
        </nav>
        <section
          id="create-canvas"
          aria-labelledby="canvas-title"
          className="grid scroll-mt-6 gap-x-10 lg:grid-cols-[1.15fr_0.85fr] xl:gap-x-16"
        >
          <div className="lg:col-start-2 lg:row-start-1">
            <p className={eyebrow}>{t("eyebrow")}</p>
            <h1
              id="canvas-title"
              className="mt-4 font-serif text-[clamp(2.65rem,4.6vw,4.25rem)] leading-[1.04] tracking-[-0.045em]"
            >
              {product.title}
            </h1>
            <CanvasProductRating locale={locale} />
            <p className="mt-4 max-w-lg text-sm leading-7 text-gray">
              {t("description")}
            </p>
            <p className="mt-4 flex items-start gap-2.5 text-xs leading-5 text-primary-dark">
              <Frame
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0"
                strokeWidth={1.5}
              />
              {t("readyToHang")}
            </p>
          </div>
          <div className="mt-7 min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <CanvasStudioPreview />
          </div>
          <div className="min-w-0 lg:col-start-2 lg:row-start-2">
            <CanvasConfigurator />
          </div>
        </section>
      </div>

      <CanvasTrustedBy />

      <div className="border-y border-secondary/10 bg-[#F3F1EB]">
        <ul className="mx-auto grid max-w-[1360px] divide-y divide-secondary/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-10">
          {[
            { key: "guarantee", icon: ShieldCheck },
            { key: "hanging", icon: Frame },
            { key: "pickup", icon: MapPin },
          ].map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="flex min-h-20 items-center justify-center gap-3 py-5 sm:px-4"
            >
              <Icon
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-primary-dark"
                strokeWidth={1.3}
              />
              <span className="text-xs leading-5">
                {t(`assurances.${key}`, { years })}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <section
        aria-labelledby="canvas-craft-title"
        className="bg-secondary text-[#FCFBF8]"
      >
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="relative min-h-[360px] sm:min-h-[480px]">
            <Image
              src="/canvas-stretching.jpeg"
              alt={t("gallery.workshop")}
              fill
              sizes="(min-width: 1440px) 720px, (min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#D9AE87]">
              {t("craft.eyebrow")}
            </p>
            <h2 id="canvas-craft-title" className={`mt-5 max-w-lg ${heading}`}>
              {t("craft.title")}{" "}
              <span className="italic text-[#D9AE87]">{t("craft.accent")}</span>
            </h2>
            <div className="mt-8 divide-y divide-white/15">
              {["material", "colour", "finish"].map((key, index) => (
                <div key={key} className="flex gap-5 py-5">
                  <span
                    aria-hidden="true"
                    className="pt-0.5 font-serif text-xl italic text-[#D9AE87]"
                  >
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">
                      {t(`craft.${key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      {t(`craft.${key}.description`, { years })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href={`/${locale}/how-we-make-our-canvas-prints`}
              className={`mt-5 inline-flex min-h-11 items-center gap-5 text-[13px] text-[#FCFBF8] underline decoration-white/30 underline-offset-8 hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`}
            >
              {t("craft.link")}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CanvasComparison />

      <section
        aria-labelledby="canvas-details-title"
        className="mx-auto grid max-w-[1360px] gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-24"
      >
        <div>
          <p className={eyebrow}>{t("details.eyebrow")}</p>
          <h2 id="canvas-details-title" className={`mt-4 max-w-sm ${heading}`}>
            {t("details.title")}
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-gray">
            {t("details.description")}
          </p>
          <Link
            href={`/${locale}/quality-guarantee`}
            className={`mt-6 ${link}`}
          >
            {t("details.guaranteeLink")}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <dl className="divide-y divide-secondary/15 border-y border-secondary/15">
          {["delivery", "pickup", "shipping", "guarantee", "custom"].map(
            (key) => (
              <div
                key={key}
                className="grid gap-2 py-5 sm:grid-cols-[0.65fr_1.35fr] sm:gap-6"
              >
                <dt className="text-xs font-medium leading-6">
                  {t(`details.${key}.title`)}
                </dt>
                <dd className="text-sm leading-6 text-gray">
                  {t(`details.${key}.description`, {
                    earliest: date(estimate.earliest),
                    latest: date(estimate.latest),
                    days,
                    years,
                  })}
                </dd>
              </div>
            )
          )}
        </dl>
      </section>

      <section
        aria-labelledby="canvas-faq-title"
        className="border-y border-secondary/10 bg-[#F3F1EB]"
      >
        <div className="mx-auto grid max-w-[1360px] gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-20">
          <div>
            <p className={eyebrow}>{t("faq.eyebrow")}</p>
            <h2 id="canvas-faq-title" className={`mt-4 max-w-sm ${heading}`}>
              {t("faq.title")}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-gray">
              {p("canvasPage.faq.intro")}
            </p>
            <Link href={`/${locale}/contact`} className={`mt-6 ${link}`}>
              {t("faq.contact")}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-secondary/15 border-y border-secondary/15">
            {faqs.map((key) => (
              <details key={key} className="group">
                <summary
                  className={`flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-sm font-medium leading-6 [&::-webkit-details-marker]:hidden ${focus}`}
                >
                  <span>{p(`faq.questions.${key}.question`)}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-primary-dark transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="pb-6 pr-6 text-sm leading-7 text-gray">
                  {p(`faq.questions.${key}.answer`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CanvasReviews locale={locale} />

      <section
        aria-labelledby="canvas-alternative-title"
        className="mx-auto flex max-w-[1360px] flex-col justify-between gap-8 px-6 py-14 sm:px-10 lg:flex-row lg:items-center lg:py-20"
      >
        <div>
          <p className={eyebrow}>{t("alternative.eyebrow")}</p>
          <h2
            id="canvas-alternative-title"
            className="mt-4 font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-4xl"
          >
            {t("alternative.title")}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-gray">
            {t("alternative.description")}
          </p>
        </div>
        <Link
          href={`/${locale}/product/rolled-canvas-prints`}
          className={`inline-flex min-h-12 shrink-0 items-center justify-center gap-7 self-start rounded-full border border-secondary/25 px-6 py-3 text-[13px] font-medium transition-colors hover:border-primary-dark hover:text-primary-dark lg:self-auto ${focus}`}
        >
          {p("canvasPage.alternative.ctaLabel")}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
