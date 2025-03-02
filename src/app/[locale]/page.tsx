import { Metadata } from "next";
import { ButtonLink, ProductPreview, SectionContainer } from "@/components";
import { getProductList } from "@/lib/shopify";
import { ArrowRight, CircleCheck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

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
    openGraph: {
      title: t("og.title"),
      description: t("og.description"),
      url: "https://canvasprintshop.ca",
      siteName: "Canvas Print Shop",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "website",
    },
  };
}

const Home = async () => {
  const locale = await getLocale();
  const t = await getTranslations("Home");
  const products = await getProductList({});

  const benefits = [
    {
      title: t("benefits.premium.title"),
      description: t("benefits.premium.description"),
      url: "/canvas-tools.jpeg",
    },
    {
      title: t("benefits.craftsmanship.title"),
      description: t("benefits.craftsmanship.description"),
      url: "/canvas-making.jpeg",
    },
    {
      title: t("benefits.process.title"),
      description: t("benefits.process.description"),
      url: "/upload-process.png",
    },
    {
      title: t("benefits.technology.title"),
      description: t("benefits.technology.description"),
      url: "/canvas-in-living-room.jpeg",
    },
  ];

  const process = [
    {
      title: t("process.upload.title"),
      description: t("process.upload.description"),
    },
    {
      title: t("process.select.title"),
      description: t("process.select.description"),
    },
    {
      title: t("process.create.title"),
      description: t("process.create.description"),
    },
    {
      title: t("process.enjoy.title"),
      description: t("process.enjoy.description"),
    },
  ];

  const testimonials = [
    {
      quote: t("testimonials.first.quote"),
      author: t("testimonials.first.author"),
    },
    {
      quote: t("testimonials.second.quote"),
      author: t("testimonials.second.author"),
    },
  ];

  const trustBadges = [
    t("trustBadges.secure"),
    t("trustBadges.ssl"),
    t("trustBadges.shipping"),
    t("trustBadges.made"),
    t("trustBadges.satisfaction"),
  ];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background border-b border-gray-light/10">
        {/* Background Image */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <Image
            src="/canvas-example.jpeg"
            alt=""
            fill
            priority
            quality={80}
            className="object-cover opacity-30"
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEB..."
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-gray">{t("hero.description")}</p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
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
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-secondary">
            {t("benefits.heading")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center flex flex-col items-center transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mb-5 relative rounded-lg overflow-hidden shadow-md">
                  <Image
                    width={240}
                    height={180}
                    src={benefit.url}
                    alt={benefit.title}
                    className="object-cover w-full h-48"
                    priority={index < 2} // Add priority for above-the-fold images
                    loading={index < 2 ? "eager" : "lazy"} // Explicitly set loading strategy
                    quality={80} // Reduce quality slightly for faster loading
                  />
                </div>
                <div className="bg-white rounded-full shadow-md p-2 -mt-8 mb-4 relative z-10 border-2 border-white">
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
      {/* Featured Collections */}
      <section className="relative py-12 sm:py-24 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-3 sm:mb-4">
              {t("featured.heading")}
            </h2>
            <p className="text-base sm:text-lg text-secondary/80 max-w-2xl mx-auto">
              {t("featured.description")}
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 md:gap-12">
            {products.map((product, index) => (
              <ProductPreview
                key={product.id}
                product={product}
                direction={index % 2 === 0 ? "right" : "left"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-secondary">
            {t("process.heading")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {process.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-secondary">
                  {step.title}
                </h3>
                <p className="text-gray">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-secondary">
            {t("testimonials.heading")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <SectionContainer key={index} className="!bg-white">
                <p className="text-gray mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-secondary font-medium">
                  {testimonial.author}
                </p>
              </SectionContainer>
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

export default Home;
