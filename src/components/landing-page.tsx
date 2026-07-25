import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleCheck, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components";
import type { Product } from "@/types/product";

interface LandingPageProps {
  heading: string;
  description: string;
  subheading?: string;
  intro: { title: string; body: string };
  details: { title: string; items: { title: string; description: string }[] };
  faq: { q: string; a: string }[];
  faqHeading: string;
  benefits: { title: string; description: string }[];
  products: Product[];
  locale: string;
  ctaText: string;
  trustBadges: string[];
  breadcrumb: { home: string; canvasPrints: string; current: string };
  relatedHeading: string;
  related: { label: string; slug: string }[];
  /** Live "order today, get it by ..." estimate — same source as the product page. */
  delivery?: { label: string; range: string };
}

const LandingPage: React.FC<LandingPageProps> = ({
  heading,
  description,
  subheading,
  intro,
  details,
  faq,
  faqHeading,
  benefits,
  products,
  locale,
  ctaText,
  trustBadges,
  breadcrumb,
  relatedHeading,
  related,
  delivery,
}) => {
  const primaryProduct = products[0];

  return (
    <main className="flex-1">
      {/* Breadcrumb — mirrors the BreadcrumbList schema on the page */}
      <nav
        aria-label="Breadcrumb"
        className="container mx-auto px-4 pt-4 text-sm text-gray"
      >
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href={`/${locale}`} className="hover:underline">
              {breadcrumb.home}
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <li>
            <Link href={`/${locale}/shop`} className="hover:underline">
              {breadcrumb.canvasPrints}
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <li aria-current="page" className="text-secondary">
            {breadcrumb.current}
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background border-b border-gray-light/10">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/canvas-example.jpeg"
            alt=""
            fill
            priority
            quality={80}
            className="object-cover opacity-30"
            sizes="100vw"
          />
        </div>
        <div className="relative mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary">
              {heading}
            </h1>
            <p className="text-xl text-gray max-w-3xl mx-auto">{description}</p>
            {subheading && <p className="text-lg text-gray/80">{subheading}</p>}
            {delivery && (
              <p className="inline-flex flex-wrap items-center justify-center gap-1 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
                <span>📦 {delivery.label}</span>
                <strong>{delivery.range}</strong>
              </p>
            )}
            {primaryProduct && (
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <ButtonLink
                  href={`/${locale}/product/${primaryProduct.handle}`}
                  icon={ArrowRight}
                >
                  {ctaText}
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Page-specific introduction — the substance that makes each landing
          page worth indexing on its own rather than a keyword doorway. */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary">
              {intro.title}
            </h2>
            {intro.body.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-gray leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center flex flex-col items-center"
              >
                <div className="bg-white rounded-full shadow-md p-2 mb-4 border-2 border-white">
                  <CircleCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Page-specific details */}
      {details.items.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-8">
                {details.title}
              </h2>
              <dl className="space-y-6">
                {details.items.map((item, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary/30 pl-4"
                  >
                    <dt className="font-semibold text-secondary">
                      {item.title}
                    </dt>
                    <dd className="text-gray mt-1">{item.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      {/* FAQ — backs the FAQPage structured data */}
      {faq.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-8">
                {faqHeading}
              </h2>
              <div className="space-y-6">
                {faq.map((item, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold text-secondary mb-2">
                      {item.q}
                    </h3>
                    <p className="text-gray leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products CTA */}
      <section className="py-16 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            {products.map((product) => (
              <ButtonLink
                key={product.id}
                href={`/${locale}/product/${product.handle}`}
                icon={ArrowRight}
              >
                {product.title}
              </ButtonLink>
            ))}
          </div>
        </div>
      </section>

      {/* Related landing pages — internal linking so these pages are no longer
          orphans reachable only from the sitemap. */}
      {related?.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-light/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-lg font-semibold text-secondary mb-4">
                {relatedHeading}
              </h2>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/${locale}/canvas-prints/${item.slug}`}
                      className="text-primary hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="border-t border-gray-light/10 bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center text-sm text-gray">
            {trustBadges.map((badge, index) => (
              <div key={index}>✓ {badge}</div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
