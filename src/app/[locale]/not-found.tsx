import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { noIndexMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  ...noIndexMetadata,
};

const NotFound = async () => {
  const locale = await getLocale();
  const t = await getTranslations("NotFound");

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-24 text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-secondary mb-4">
          {t("heading")}
        </h1>
        <p className="text-gray mb-8">{t("body")}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={`/${locale}`}
            className="rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            {t("home")}
          </Link>
          <Link
            href={`/${locale}/shop`}
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-secondary hover:bg-gray-50"
          >
            {t("shop")}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
