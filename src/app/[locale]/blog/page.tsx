import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listPosts } from "@/lib/blog";
import { BASE_URL } from "@/lib/constants";
import { canonicalMetadata, openGraphMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    ...canonicalMetadata(locale, "/blog"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      ...openGraphMetadata(locale, "/blog"),
    },
  };
}

export default async function BlogIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Blog");
  const posts = listPosts();
  const lang = locale === "fr" ? "fr" : "en";

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: t("heading"),
            url: `${BASE_URL}/${locale}/blog`,
            publisher: { "@id": `${BASE_URL}/#organization` },
          }),
        }}
      />

      <section className="bg-background border-b border-gray-light/10 py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary">
            {t("heading")}
          </h1>
          <p className="text-lg text-gray">{t("intro")}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <ul className="space-y-10">
            {posts.map((post) => {
              const content = post[lang];
              return (
                <li
                  key={post.slug}
                  className="border-b border-gray-light/10 pb-10 last:border-0"
                >
                  <article>
                    <h2 className="text-2xl font-bold text-secondary mb-2">
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="hover:text-primary hover:underline"
                      >
                        {content.title}
                      </Link>
                    </h2>
                    <time
                      dateTime={post.published}
                      className="text-sm text-gray/70"
                    >
                      {new Date(post.published).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <p className="text-gray mt-3 leading-relaxed">
                      {content.excerpt}
                    </p>
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="inline-block mt-3 text-primary hover:underline"
                    >
                      {t("readMore")}
                    </Link>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
