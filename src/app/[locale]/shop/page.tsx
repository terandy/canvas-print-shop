import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGridItems, Grid } from "@/components";
import { getProductList } from "@/lib/db/queries/products";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/constants";
import { canonicalMetadata, openGraphMetadata } from "@/lib/seo";
import { CITY_SLUGS, SIZE_SLUGS, USE_CASE_SLUGS } from "@/lib/landing-pages";

/**
 * Browse-intent collection page.
 *
 * The site previously had no listing page at all — only a single product
 * detail route and a noindexed search page — so there was nothing to rank for
 * "canvas prints" style browse queries, and the landing pages had no hub to
 * link back to. This is also the second step of every BreadcrumbList on the site.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Shop.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    ...canonicalMetadata(locale, "/shop"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      ...openGraphMetadata(locale, "/shop"),
    },
  };
}

const LinkGroup = ({
  title,
  slugs,
  locale,
  labels,
}: {
  title: string;
  slugs: readonly string[];
  locale: string;
  labels: Record<string, string>;
}) => (
  <div>
    <h3 className="font-semibold text-secondary mb-3">{title}</h3>
    <ul className="space-y-2">
      {slugs.map((slug) => (
        <li key={slug}>
          <Link
            href={`/${locale}/canvas-prints/${slug}`}
            className="text-gray hover:text-primary hover:underline"
          >
            {labels[slug] ?? slug}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Shop");
  const tLanding = await getTranslations("LandingPages");
  const products = await getProductList(locale as "en" | "fr");

  // Reuse each landing page's own H1 as its link label so the anchor text
  // matches the destination's primary keyword.
  const labels: Record<string, string> = {};
  for (const slug of [...CITY_SLUGS, ...SIZE_SLUGS, ...USE_CASE_SLUGS]) {
    labels[slug] = tLanding(`${slug}.heading`);
  }

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t("heading"),
            description: t("intro"),
            url: `${BASE_URL}/${locale}/shop`,
            isPartOf: { "@id": `${BASE_URL}/#organization` },
          }),
        }}
      />

      <section className="bg-background border-b border-gray-light/10 py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary">
            {t("heading")}
          </h1>
          <p className="text-lg text-gray">{t("intro")}</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {products.length > 0 && (
            <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <ProductGridItems products={products} />
            </Grid>
          )}
        </div>
      </section>

      {/* The landing-page hub. Every /canvas-prints/* page is reachable from
          here, so none of them are orphans. */}
      <section className="py-16 bg-background border-t border-gray-light/10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-8">
            {t("browseHeading")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <LinkGroup
              title={t("groups.cities")}
              slugs={CITY_SLUGS}
              locale={locale}
              labels={labels}
            />
            <LinkGroup
              title={t("groups.sizes")}
              slugs={SIZE_SLUGS}
              locale={locale}
              labels={labels}
            />
            <LinkGroup
              title={t("groups.useCases")}
              slugs={USE_CASE_SLUGS}
              locale={locale}
              labels={labels}
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Link
            href={`/${locale}/how-we-make-our-canvas-prints`}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            {t("processLink")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
