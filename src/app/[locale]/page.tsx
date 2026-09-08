import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Frame,
  Palette,
  MapPin,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getProductList } from "@/lib/db/queries/products";
import { BUSINESS_DATA } from "@/lib/business-data";
import { canonicalMetadata, openGraphMetadata } from "@/lib/seo";
import type { Product } from "@/types/product";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("title"),
    description: t("description"),
    ...canonicalMetadata(locale),
    openGraph: {
      title: t("og.title"),
      description: t("og.description"),
      ...openGraphMetadata(locale),
    },
  };
}

const focusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
const buttonClass = `inline-flex min-h-12 items-center justify-center gap-7 rounded-full bg-secondary px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-primary-dark ${focusClass}`;
const eyebrowClass =
  "text-[10px] font-medium uppercase tracking-[0.18em] text-primary-dark";

export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const products = (await getProductList(locale as "en" | "fr")).sort(
    (a, b) => Number(b.handle === "canvas") - Number(a.handle === "canvas")
  );
  const canvas = products.find((product) => product.handle === "canvas");
  const createHref = canvas
    ? `/${locale}/product/${canvas.handle}`
    : `/${locale}/shop`;
  const formatPrice = (product: Product | undefined) => {
    if (!product?.variants.some((variant) => variant.availableForSale))
      return undefined;
    const minimum = product.priceRange.minVariantPrice;
    const amount = Number(minimum.amount);
    if (!Number.isFinite(amount)) return undefined;
    return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: minimum.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  const startingPrice = formatPrice(canvas);

  return (
    <main className="bg-[#FCFBF8] text-secondary">
      <section
        aria-labelledby="home-title"
        className="mx-auto grid max-w-[1600px] lg:grid-cols-[0.92fr_1.08fr]"
      >
        <div className="flex flex-col items-start justify-center px-6 py-12 sm:px-10 sm:py-16 lg:py-20 xl:pl-[max(2.5rem,calc((100vw-1360px)/2))] xl:pr-12">
          <p className={eyebrowClass}>{t("hero.eyebrow")}</p>
          <h1
            id="home-title"
            className="mt-6 max-w-xl font-serif text-[clamp(2.8rem,5.5vw,5.25rem)] leading-[1.02] tracking-[-0.045em]"
          >
            {t("hero.title")}
            <span className="mt-2 block italic text-primary-dark">
              {t("hero.accent")}
            </span>
          </h1>
          <p className="mt-7 max-w-sm text-[15px] leading-7 text-gray sm:text-base">
            {t("hero.description")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href={createHref} className={buttonClass}>
              {t("hero.create")}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#prints"
              className={`inline-flex min-h-11 items-center gap-3 rounded-sm text-[13px] font-medium transition-colors hover:text-primary-dark ${focusClass}`}
            >
              {t("hero.explore")}
              <ArrowDown
                className="h-4 w-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray">
            {startingPrice
              ? t("hero.price", { price: startingPrice })
              : t("hero.madeToOrder")}
          </p>
        </div>
        <figure className="relative min-h-[350px] overflow-hidden bg-[#E5E2D8] sm:min-h-[460px] lg:min-h-[620px]">
          <Image
            src="/canvas-in-living-room.jpeg"
            alt={t("hero.imageAlt")}
            fill
            priority
            sizes="(min-width: 1600px) 864px, (min-width: 1024px) 54vw, 100vw"
            quality={80}
            className="object-cover object-[43%_50%]"
          />
          <figcaption className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-5 border border-white/50 bg-[#FCFBF8]/95 px-5 py-4 backdrop-blur-sm sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-[300px]">
            <span className="text-[12px] leading-5">
              {t("hero.imageCaption")}
            </span>
          </figcaption>
        </figure>
      </section>

      <div className="border-y border-secondary/10 bg-[#F3F1EB]">
        <ul className="mx-auto grid max-w-[1360px] divide-y divide-secondary/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-10">
          {[
            { key: "canvas", icon: Frame },
            { key: "colour", icon: Palette },
            { key: "pickup", icon: MapPin },
          ].map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="flex min-h-20 items-center justify-center gap-3 py-5 sm:px-4"
            >
              <Icon
                className="h-5 w-5 shrink-0 text-primary-dark"
                strokeWidth={1.3}
                aria-hidden="true"
              />
              <span className="text-xs leading-5">{t(`details.${key}`)}</span>
            </li>
          ))}
        </ul>
      </div>

      <section
        id="prints"
        aria-labelledby="prints-title"
        className="mx-auto max-w-[1360px] scroll-mt-8 px-6 py-16 sm:px-10 lg:py-24"
      >
        <div className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className={eyebrowClass}>{t("collection.eyebrow")}</p>
            <h2
              id="prints-title"
              className="mt-4 max-w-2xl font-serif text-4xl leading-[1.1] tracking-[-0.035em] sm:text-5xl"
            >
              {t("collection.title")}
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-gray">
            {t("collection.description")}
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2 md:gap-7">
          {products.map((product) => {
            const kind =
              product.handle === "canvas"
                ? "canvas"
                : product.handle === "rolled-canvas-prints"
                  ? "rolledCanvas"
                  : undefined;
            const price = formatPrice(product);
            const image =
              kind === "canvas"
                ? "/canvas-hanging.jpeg"
                : product.featuredImage.url;
            const title = kind ? t(`collection.${kind}.title`) : product.title;
            return (
              <article key={product.id}>
                <Link
                  href={`/${locale}/product/${product.handle}`}
                  className={`group block rounded-sm ${focusClass}`}
                >
                  <div
                    className={`relative aspect-[5/4] overflow-hidden bg-[#F0EDE6] ${kind === "rolledCanvas" ? "bg-white" : ""}`}
                  >
                    {image && (
                      <Image
                        src={image}
                        alt={
                          kind
                            ? t(`collection.${kind}.imageAlt`)
                            : product.featuredImage.altText || product.title
                        }
                        fill
                        sizes="(min-width: 1360px) 626px, (min-width: 768px) 47vw, 100vw"
                        className={`transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none ${kind === "rolledCanvas" ? "object-contain p-4 sm:p-6" : "object-cover"}`}
                      />
                    )}
                    {kind && (
                      <span className="absolute left-4 top-4 bg-[#FCFBF8]/95 px-3 py-2 text-[9px] font-medium uppercase tracking-[0.15em] sm:left-5 sm:top-5">
                        {t(`collection.${kind}.label`)}
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-5">
                    <h3 className="font-serif text-[28px] leading-tight tracking-[-0.025em] transition-colors group-hover:text-primary-dark sm:text-[32px]">
                      {title}
                    </h3>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-secondary/20 transition-colors group-hover:border-primary-dark group-hover:bg-primary-dark group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                  {kind && (
                    <p className="mt-2 max-w-md text-sm leading-6 text-gray">
                      {t(`collection.${kind}.description`)}
                    </p>
                  )}
                  {price && (
                    <p className="mt-4 text-[13px] font-medium">
                      {t("collection.price", { price })}
                    </p>
                  )}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="craft-title"
        className="bg-secondary text-[#F5F1EA]"
      >
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
          <div className="relative min-h-[360px] sm:min-h-[480px] lg:min-h-[680px]">
            <Image
              src="/canvas-stretching.jpeg"
              alt={t("craft.imageAlt")}
              fill
              sizes="(min-width: 1600px) 800px, (min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_40%]"
            />
          </div>
          <div className="px-6 py-14 sm:px-10 sm:py-16 xl:p-20">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#D6B391]">
              {t("craft.eyebrow")}
            </p>
            <h2
              id="craft-title"
              className="mt-5 max-w-lg font-serif text-4xl leading-[1.08] tracking-[-0.03em] sm:text-5xl"
            >
              {t("craft.title")}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#D2C9BF]">
              {t("craft.description")}
            </p>
            <div className="mt-8 divide-y divide-white/15 border-y border-white/15">
              {["material", "printing", "finishing"].map((key) => (
                <div key={key} className="py-5">
                  <h3 className="text-sm font-medium">
                    {t(`craft.${key}.title`)}
                  </h3>
                  <p className="mt-1.5 max-w-md text-xs leading-6 text-[#D2C9BF]">
                    {t(`craft.${key}.description`, {
                      years: BUSINESS_DATA.product.printQualityGuaranteeYears,
                    })}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href={`/${locale}/how-we-make-our-canvas-prints`}
              className={`mt-7 inline-flex min-h-11 items-center gap-6 border-b border-[#D6B391]/60 text-[13px] font-medium text-[#F5F1EA] transition-colors hover:text-[#D6B391] ${focusClass}`}
            >
              {t("craft.link")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="process-title"
        className="mx-auto max-w-[1360px] px-6 py-16 sm:px-10 lg:py-24"
      >
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className={eyebrowClass}>{t("process.eyebrow")}</p>
            <h2
              id="process-title"
              className="mt-4 max-w-xl font-serif text-4xl leading-[1.1] tracking-[-0.035em] sm:text-5xl"
            >
              {t("process.title")}
            </h2>
          </div>
          <Link
            href={`/${locale}/faqs`}
            className={`inline-flex min-h-11 items-center gap-5 self-start border-b border-secondary/30 text-[13px] font-medium transition-colors hover:text-primary-dark lg:self-end ${focusClass}`}
          >
            {t("process.help")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          {["choose", "upload", "enjoy"].map((key, index) => (
            <li key={key} className="border-t border-secondary/20 pt-6">
              <span
                aria-hidden="true"
                className="font-serif text-4xl tracking-[-0.05em] text-primary-dark"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 font-serif text-2xl tracking-[-0.02em]">
                {t(`process.${key}.title`)}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-7 text-gray">
                {t(`process.${key}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="create-title"
        className="border-y border-secondary/10 bg-[#EFEAE0]"
      >
        <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-9 px-6 py-14 sm:px-10 sm:py-16 lg:flex-row lg:items-center">
          <div>
            <p className={eyebrowClass}>{t("closing.eyebrow")}</p>
            <h2
              id="create-title"
              className="mt-4 max-w-2xl font-serif text-4xl leading-[1.1] tracking-[-0.035em] sm:text-5xl"
            >
              {t("closing.title")}
            </h2>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-4 lg:items-center">
            <Link href={`/${locale}/shop`} className={buttonClass}>
              {t("closing.create")}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className={`inline-flex min-h-11 items-center rounded-sm text-xs text-gray underline underline-offset-4 transition-colors hover:text-primary-dark ${focusClass}`}
            >
              {t("closing.help")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
