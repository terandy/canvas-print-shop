import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Rolled versus stretched, on both product pages, each linking to the other.
 *
 * Two products that are the same print finished two different ways should say
 * so and point at each other: it is the question customers are actually asking
 * at this point, and the reciprocal link is how the relationship between the
 * two pages is discoverable at all.
 */
export default async function ProductAlternative({
  namespace,
  href,
}: {
  /** `Product.<namespace>.alternative` holds this product's side of the copy. */
  namespace: string;
  href: string;
}) {
  const t = await getTranslations(`Product.${namespace}.alternative`);
  const points = ["one", "two", "three"] as const;

  return (
    <section
      className="border-y border-neutral-200 bg-neutral-50"
      aria-labelledby="product-alternative"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <h2
              id="product-alternative"
              className="mb-3 text-2xl font-bold text-secondary sm:text-3xl"
            >
              {t("title")}
            </h2>
            <p className="mb-5 leading-relaxed text-gray">{t("description")}</p>
            <ul className="space-y-2 text-sm text-secondary">
              {points.map((key) => (
                <li key={key} className="flex gap-2.5">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  {t(`points.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="mb-4 leading-relaxed text-secondary">
              {t("ctaLead")}
            </p>
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {/* Descriptive anchor text: the linked page's subject, not "click here". */}
              {t("ctaLabel")}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
