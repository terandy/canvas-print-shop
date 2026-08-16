import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProductList } from "@/lib/db/queries/products";
import { BASE_URL } from "@/lib/constants";
import LandingPage from "@/components/landing-page";
import { canonicalMetadata, openGraphMetadata } from "@/lib/seo";
import { isValidSlug } from "@/lib/landing-pages";
import { formatDeliveryRange } from "@/lib/delivery";
import {
  BUSINESS_DATA,
  getLocationAddressLines,
  type SupportedLocale,
} from "@/lib/business-data";
import { formatAcceptedImageFormats } from "@/lib/images/formats";
import {
  buildMontrealWebPageStructuredData,
  serializeJsonLd,
} from "@/lib/structured-data";

/**
 * Rendered on demand rather than prerendered.
 *
 * This route previously exported `generateStaticParams`, which opted it into
 * static generation — but the shared locale layout calls `headers()` and
 * `cookies()` for cart/admin detection. Dynamic APIs cannot run during static
 * generation, so every one of these pages threw DYNAMIC_SERVER_USAGE and served
 * a 500 in production. Every other route in the app is already dynamic.
 */
export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ locale: string; slug: string }> };

/** Reads an optional list of `{ q, a }` entries out of the messages file. */
const readFaq = (
  t: Awaited<ReturnType<typeof getTranslations>>
): { q: string; a: string }[] => {
  const raw = t.raw("faq");
  return Array.isArray(raw) ? raw : [];
};

/** Reads the optional page-specific detail bullets. */
const readDetailItems = (
  t: Awaited<ReturnType<typeof getTranslations>>
): { title: string; description: string }[] => {
  const raw = t.raw("details.items");
  return Array.isArray(raw) ? raw : [];
};

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;

  // Calling notFound() here renders the 404 page but leaves the HTTP status at
  // 200 — a soft 404, which Google reports as an error. The page component
  // below does the real rejecting; this just avoids throwing on a missing
  // translation namespace first.
  if (!isValidSlug(slug)) return { title: "Not Found" };

  const t = await getTranslations({
    locale,
    namespace: `LandingPages.${slug}`,
  });

  const path = `/canvas-prints/${slug}`;

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    ...canonicalMetadata(locale, path),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      ...openGraphMetadata(locale, path),
    },
  };
}

export default async function LandingPageRoute({ params }: PageParams) {
  const { locale, slug } = await params;

  // Retired slugs (calgary/vancouver/edmonton) are 308'd at the edge — see
  // `redirects()` in next.config.ts — so they never reach this component.
  if (!isValidSlug(slug)) return notFound();

  const t = await getTranslations(`LandingPages.${slug}`);
  const tCommon = await getTranslations("LandingPages.common");
  const products = await getProductList(locale as "en" | "fr");
  const acceptedFormats = formatAcceptedImageFormats(locale);
  const fillOperationalFacts = (value: string) =>
    value.replaceAll("{formats}", acceptedFormats);

  const benefits = [
    {
      title: t("benefits.one.title"),
      description: t("benefits.one.description"),
    },
    {
      title: t("benefits.two.title"),
      description: t("benefits.two.description"),
    },
    {
      title: t("benefits.three.title"),
      description: t("benefits.three.description"),
    },
  ];

  const trustBadges = [
    tCommon("trustBadges.secure"),
    tCommon("trustBadges.shipping"),
    tCommon("trustBadges.made"),
    tCommon("trustBadges.satisfaction"),
    tCommon("trustBadges.guarantee"),
  ];

  const faq = readFaq(t).map(({ q, a }) => ({
    q: fillOperationalFacts(q),
    a: fillOperationalFacts(a),
  }));
  const detailItems = readDetailItems(t).map(({ title, description }) => ({
    title: fillOperationalFacts(title),
    description: fillOperationalFacts(description),
  }));
  const pageUrl = `${BASE_URL}/${locale}/canvas-prints/${slug}`;

  const structuredData: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: tCommon("breadcrumb.home"),
          item: `${BASE_URL}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: tCommon("breadcrumb.canvasPrints"),
          item: `${BASE_URL}/${locale}/shop`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: t("heading"),
          item: pageUrl,
        },
      ],
    },
  ];

  if (faq.length > 0) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }

  if (slug === "montreal") {
    structuredData.push(
      buildMontrealWebPageStructuredData(
        locale as SupportedLocale,
        t("heading"),
        t("meta.description")
      )
    );
  }

  const montrealLocation = BUSINESS_DATA.locations.montrealBranch;

  return (
    <>
      {structuredData.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <LandingPage
        heading={t("heading")}
        description={t("description")}
        subheading={t("subheading")}
        intro={{ title: t("intro.title"), body: t("intro.body") }}
        details={{ title: t("details.title"), items: detailItems }}
        faq={faq}
        faqHeading={tCommon("faqHeading")}
        benefits={benefits}
        products={products}
        locale={locale}
        ctaText={tCommon("orderNow")}
        trustBadges={trustBadges}
        breadcrumb={{
          home: tCommon("breadcrumb.home"),
          canvasPrints: tCommon("breadcrumb.canvasPrints"),
          current: t("heading"),
        }}
        relatedHeading={tCommon("relatedHeading")}
        related={t.raw("related") as { label: string; slug: string }[]}
        delivery={{
          label: tCommon("delivery.getItBy"),
          range: formatDeliveryRange(locale),
        }}
        location={
          slug === "montreal"
            ? {
                heading: t("location.heading"),
                name: montrealLocation.name,
                addressLines: getLocationAddressLines(
                  montrealLocation,
                  locale as SupportedLocale
                ),
              }
            : undefined
        }
      />
    </>
  );
}
