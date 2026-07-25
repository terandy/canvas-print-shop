import Image from "next/image";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import ContactInfo from "./contact-info";
import { getLocale, getTranslations } from "next-intl/server";
import { QuickLinks } from "./navbar";
import { CITY_SLUGS, USE_CASE_SLUGS } from "@/lib/landing-pages";

/** A handful of the highest-intent landing pages, linked site-wide. */
const FOOTER_USE_CASES = [
  "custom",
  "framed",
  "large",
  "wall-art",
  "wedding",
  "family",
] as const satisfies readonly (typeof USE_CASE_SLUGS)[number][];

const Footer = async () => {
  const t = await getTranslations("Footer");
  const tLanding = await getTranslations("LandingPages");
  const locale = await getLocale();

  const paymentMethods = [
    { name: "Visa", icon: "/visa.svg", width: 48, height: 32 },
    { name: "Mastercard", icon: "/mastercard.svg", width: 48, height: 32 },
    { name: "American Express", icon: "/amex.svg", width: 48, height: 32 },
    { name: "Discover", icon: "/discover.svg", width: 48, height: 32 },
    { name: "Diners Club", icon: "/diners.svg", width: 48, height: 32 },
    { name: "Apple Pay", icon: "/apple-pay.svg", width: 48, height: 32 },
    { name: "Interac", icon: "/interac.svg", width: 48, height: 32 },
    { name: "Google Pay", icon: "/google-pay.svg", width: 48, height: 32 },
    { name: "Shop Pay", icon: "/shop-pay.svg", width: 48, height: 32 },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {t("companyName")}
              </h3>
              <p className="mt-4 text-sm text-gray-600">
                {t("companyDescription")}
              </p>
            </div>
            <QuickLinks size="sm" />
            {/* Contact info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {t("contactUs")}
              </h3>
              <ContactInfo className="mt-4 text-sm" />
            </div>
          </div>
        </div>

        {/*
          Site-wide links into the landing-page hub. Before this, nothing on the
          site linked to /canvas-prints/* at all — every one of those pages was
          an orphan reachable only from the sitemap.
        */}
        <div className="border-t border-gray-200 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {t("explore")}
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    href={`/${locale}/shop`}
                    className="text-gray-600 hover:text-gray-900 hover:underline"
                  >
                    {t("shop")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/blog`}
                    className="text-gray-600 hover:text-gray-900 hover:underline"
                  >
                    {t("blog")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {t("cities")}
              </h3>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {CITY_SLUGS.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/${locale}/canvas-prints/${slug}`}
                      className="text-gray-600 hover:text-gray-900 hover:underline"
                    >
                      {tLanding(`${slug}.heading`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {t("popular")}
              </h3>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {FOOTER_USE_CASES.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/${locale}/canvas-prints/${slug}`}
                      className="text-gray-600 hover:text-gray-900 hover:underline"
                    >
                      {tLanding(`${slug}.heading`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t border-gray-200 py-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <CreditCard className="h-4 w-4 text-gray-900" />
            <h3 className="text-sm font-semibold text-gray-900">
              {t("securePayment")}
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="h-8 w-12 flex items-center justify-center grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all"
              >
                <Image
                  src={method.icon}
                  alt={t("paymentAlt", { method: method.name })}
                  width={method.width}
                  height={method.height}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 py-8">
          <p className="text-sm text-center text-gray-500">
            © {new Date().getFullYear()} {t("companyName")}. {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
