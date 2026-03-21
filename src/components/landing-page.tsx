import Image from "next/image";
import { ArrowRight, CircleCheck } from "lucide-react";
import { ButtonLink } from "@/components";
import type { Product } from "@/types/product";

interface LandingPageProps {
  heading: string;
  description: string;
  subheading?: string;
  benefits: { title: string; description: string }[];
  products: Product[];
  locale: string;
  ctaText: string;
  trustBadges: string[];
}

const LandingPage: React.FC<LandingPageProps> = ({
  heading,
  description,
  subheading,
  benefits,
  products,
  locale,
  ctaText,
  trustBadges,
}) => {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background border-b border-gray-light/10">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/canvas-example.jpeg"
            alt={heading}
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
            {subheading && (
              <p className="text-lg text-gray/80">{subheading}</p>
            )}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {products.map((product) => (
                <ButtonLink
                  key={product.id}
                  href={`/${locale}/product/${product.handle}`}
                  icon={ArrowRight}
                >
                  {ctaText}
                </ButtonLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
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
                <h2 className="text-xl font-semibold text-secondary mb-2">
                  {benefit.title}
                </h2>
                <p className="text-gray">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
