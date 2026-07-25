import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getPost, listPosts } from "@/lib/blog";
import { BASE_URL } from "@/lib/constants";
import { canonicalMetadata, openGraphMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  // See the landing route: notFound() in generateMetadata produces a soft 404
  // (200 status). The page component below sets the real 404.
  if (!post) return { title: "Not Found" };

  const content = post[locale === "fr" ? "fr" : "en"];
  const path = `/blog/${slug}`;

  return {
    title: content.title,
    description: content.description,
    ...canonicalMetadata(locale, path),
    openGraph: {
      title: content.title,
      description: content.description,
      ...openGraphMetadata(locale, path),
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
    },
  };
}

export default async function BlogPostPage({ params }: PageParams) {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) return notFound();

  const lang = locale === "fr" ? "fr" : "en";
  const content = post[lang];
  const t = await getTranslations("Blog");
  const tBreadcrumb = await getTranslations("LandingPages.common.breadcrumb");
  const url = `${BASE_URL}/${locale}/blog/${slug}`;
  const others = listPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: content.title,
            description: content.description,
            datePublished: post.published,
            dateModified: post.updated ?? post.published,
            inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
            author: { "@id": `${BASE_URL}/#organization` },
            publisher: { "@id": `${BASE_URL}/#organization` },
            mainEntityOfPage: url,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: tBreadcrumb("home"),
                item: `${BASE_URL}/${locale}`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: t("heading"),
                item: `${BASE_URL}/${locale}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: content.title,
                item: url,
              },
            ],
          }),
        }}
      />

      <nav
        aria-label="Breadcrumb"
        className="container mx-auto px-4 pt-4 text-sm text-gray max-w-3xl"
      >
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href={`/${locale}`} className="hover:underline">
              {tBreadcrumb("home")}
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <li>
            <Link href={`/${locale}/blog`} className="hover:underline">
              {t("heading")}
            </Link>
          </li>
        </ol>
      </nav>

      <article className="container mx-auto px-4 max-w-3xl py-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
            {content.title}
          </h1>
          <time dateTime={post.published} className="text-sm text-gray/70">
            {new Date(post.published).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <p className="text-lg text-gray mt-4 leading-relaxed">
            {content.excerpt}
          </p>
        </header>

        <div className="space-y-5">
          {content.body.map((block, i) =>
            block.startsWith("## ") ? (
              <h2 key={i} className="text-2xl font-bold text-secondary pt-4">
                {block.slice(3)}
              </h2>
            ) : (
              <p key={i} className="text-gray leading-relaxed">
                {block}
              </p>
            )
          )}
        </div>

        <div className="mt-12 rounded-lg bg-background p-6 text-center">
          <p className="text-gray mb-4">{t("cta.text")}</p>
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            {t("cta.button")}
          </Link>
        </div>

        {others.length > 0 && (
          <aside className="mt-12 border-t border-gray-light/10 pt-8">
            <h2 className="text-lg font-semibold text-secondary mb-4">
              {t("moreReading")}
            </h2>
            <ul className="space-y-2">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${locale}/blog/${p.slug}`}
                    className="text-primary hover:underline"
                  >
                    {p[lang].title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </main>
  );
}
