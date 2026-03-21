import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProductList } from "@/lib/db/queries/products";
import { BASE_URL } from "@/lib/constants";
import LandingPage from "@/components/landing-page";

// All valid landing page slugs
const VALID_SLUGS = [
  // City pages
  "toronto",
  "calgary",
  "vancouver",
  "edmonton",
  "montreal",
  "ottawa",
  "quebec-city",
  // Size pages
  "16x20",
  "24x36",
  "36x48",
  // Use-case pages
  "wedding",
  "family",
  "pet-portrait",
  "bedroom",
  "living-room",
  "large",
  "framed",
  "custom",
  "wall-art",
  "gallery-wrap",
  "personalized",
] as const;

type Slug = (typeof VALID_SLUGS)[number];

export async function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!VALID_SLUGS.includes(slug as Slug)) return notFound();

  const t = await getTranslations({
    locale,
    namespace: `LandingPages.${slug}`,
  });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/canvas-prints/${slug}`,
      languages: {
        en: `${BASE_URL}/en/canvas-prints/${slug}`,
        fr: `${BASE_URL}/fr/canvas-prints/${slug}`,
      },
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: `${BASE_URL}/${locale}/canvas-prints/${slug}`,
      siteName: "Canvas Print Shop",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "website",
    },
  };
}

export default async function LandingPageRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!VALID_SLUGS.includes(slug as Slug)) return notFound();

  const t = await getTranslations(`LandingPages.${slug}`);
  const tCommon = await getTranslations("LandingPages.common");
  const products = await getProductList(locale as "en" | "fr");

  const benefits = [
    { title: t("benefits.one.title"), description: t("benefits.one.description") },
    { title: t("benefits.two.title"), description: t("benefits.two.description") },
    { title: t("benefits.three.title"), description: t("benefits.three.description") },
  ];

  const trustBadges = [
    tCommon("trustBadges.secure"),
    tCommon("trustBadges.shipping"),
    tCommon("trustBadges.made"),
    tCommon("trustBadges.satisfaction"),
    tCommon("trustBadges.guarantee"),
  ];

  return (
    <LandingPage
      heading={t("heading")}
      description={t("description")}
      subheading={t("subheading")}
      benefits={benefits}
      products={products}
      locale={locale}
      ctaText={tCommon("orderNow")}
      trustBadges={trustBadges}
    />
  );
}
