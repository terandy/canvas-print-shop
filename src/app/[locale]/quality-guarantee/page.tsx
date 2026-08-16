import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { canonicalMetadata, openGraphMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "QualityGuarantee.metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
    ...canonicalMetadata(locale, "/quality-guarantee"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      ...openGraphMetadata(locale, "/quality-guarantee"),
    },
  };
}

interface QualityFeatureProps {
  title: string;
  description: string;
  image: string;
  alt: string;
}

const QualityFeature = ({
  title,
  description,
  image,
  alt,
}: QualityFeatureProps) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
        <Image
          src={image}
          alt={alt}
          width={64}
          height={64}
          className="object-cover h-full w-full"
        />
      </div>
      <div className="pt-1">
        <h3 className="text-xl font-bold text-secondary">{title}</h3>
        <p className="mt-2 text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const featureKeys = ["canvas", "technology", "craftsmanship"] as const;
const comparisonKeys = [
  "material",
  "technology",
  "opacity",
  "frame",
  "craftsmanship",
  "readyToHang",
] as const;
const workshopImages = [
  { key: "printer", src: "/canon-colorado.jpeg" },
  { key: "canvas", src: "/canvas-cotton.jpeg" },
  { key: "stretching", src: "/canvas-stretching.jpeg" },
  { key: "frames", src: "/stretcher-frame-example.jpeg" },
] as const;

const OurQualityPage = async () => {
  const locale = await getLocale();
  const t = await getTranslations("QualityGuarantee");
  const featureImages = {
    canvas: "/canvas-cotton.jpeg",
    technology: "/canon-colorado.jpeg",
    craftsmanship: "/canvas-making.jpeg",
  } as const;

  return (
    <main className="bg-gray-50 text-secondary font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-extrabold text-secondary tracking-tighter">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-8">
            {t("hero.description")}
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
            {t("hero.workshop")}
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 -mt-16 mb-24">
          {featureKeys.map((key) => (
            <QualityFeature
              key={key}
              title={t(`features.${key}.title`)}
              description={t(`features.${key}.description`)}
              image={featureImages[key]}
              alt={t(`features.${key}.alt`)}
            />
          ))}
        </section>

        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-12">
            {t("comparison.title")}
          </h2>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-lg p-2 md:p-4">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="p-4 text-sm font-semibold uppercase text-gray-500">
                    {t("comparison.labels.feature")}
                  </th>
                  <th className="p-4 w-2/5 text-sm font-semibold uppercase text-center bg-primary/10 rounded-t-lg text-primary-dark">
                    Canvas Print Shop
                  </th>
                  <th className="p-4 w-2/5 text-sm font-semibold uppercase text-center text-gray-500">
                    {t("comparison.labels.budget")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonKeys.map((key, index) => (
                  <tr key={key} className="border-t border-gray-100">
                    <td className="p-4 font-medium">
                      {t(`comparison.rows.${key}.feature`)}
                    </td>
                    <td
                      className={`p-4 text-center bg-primary/5 font-semibold ${
                        index === comparisonKeys.length - 1
                          ? "rounded-b-lg"
                          : ""
                      }`}
                    >
                      {t(`comparison.rows.${key}.ours`)}
                    </td>
                    <td className="p-4 text-center text-gray-500">
                      {t(`comparison.rows.${key}.budget`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="text-center bg-white py-16 md:py-24 rounded-2xl shadow-xl mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            {t("workshop.title")}
          </h2>
          <p className="max-w-3xl mx-auto text-gray-600 mb-12">
            {t("workshop.description")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
            {workshopImages.map(({ key, src }) => (
              <figure
                key={key}
                className="group relative overflow-hidden rounded-xl shadow-md"
              >
                <Image
                  src={src}
                  alt={t(`workshop.images.${key}.alt`)}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <figcaption className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="absolute bottom-4 left-4 text-white text-lg font-bold">
                    {t(`workshop.images.${key}.caption`)}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="text-center py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{t("cta.description")}</p>
          <div className="mt-8">
            <Link
              href={`/${locale}/product/canvas`}
              className="inline-block bg-primary text-white font-bold text-lg py-4 px-12 rounded-full hover:bg-primary-dark transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {t("cta.button")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default OurQualityPage;
