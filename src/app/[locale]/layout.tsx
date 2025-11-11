import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { getCart } from "@/lib/shopify";
import { Navbar, Footer, TrustStrip } from "@/components";
import { CartProvider } from "@/contexts";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { Geist } from "next/font/google";
import GoogleAnalytics from "@/components/google-analytics";

const geist = Geist({
  subsets: ["latin"],
});

const BASE_URL = process.env.BASE_URL;

export const metadata: Metadata = {
  title: "Canvas Print Shop",
  description: "Create your own custom decor",
  icons: {
    icon: "/favicon.svg",
  },
};

const TRUST_STRIP_KEYS = [
  "madeInCanada",
  "freeDelivery",
  "happinessGuarantee",
] as const;

const TRUST_STRIP_FALLBACK: Record<
  string,
  Record<(typeof TRUST_STRIP_KEYS)[number], string>
> = {
  en: {
    madeInCanada: "Made in Canada",
    freeDelivery: "Free delivery over $150",
    happinessGuarantee: "100% happiness guarantee",
  },
  fr: {
    madeInCanada: "Fabriqué au Canada",
    freeDelivery: "Livraison gratuite à partir de 150 $",
    happinessGuarantee: "Garantie bonheur 100 %",
  },
};

const getTrustStripItems = (
  locale: string,
  messages: AbstractIntlMessages
): string[] => {
  const trustStrip =
    (messages["trustStrip"] as
      | Record<(typeof TRUST_STRIP_KEYS)[number], string>
      | undefined) ?? undefined;

  const items =
    trustStrip &&
    TRUST_STRIP_KEYS.map((key) => trustStrip[key]).filter(
      (value): value is string => Boolean(value)
    );

  if (items && items.length === TRUST_STRIP_KEYS.length) {
    return items;
  }

  const fallback =
    TRUST_STRIP_FALLBACK[locale as keyof typeof TRUST_STRIP_FALLBACK] ??
    TRUST_STRIP_FALLBACK.en;

  return TRUST_STRIP_KEYS.map((key) => fallback[key]);
};

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

const LocaleLayout = async ({ children, params }: Props) => {
  const cookiesStore = await cookies();
  const cartId = cookiesStore.get("cartId")?.value;
  const cart = await getCart(cartId);

  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  const alternates = routing.locales.map((loc) => ({
    hrefLang: `${loc}-CA`, // e.g. en-CA, fr-CA
    href: `${BASE_URL}/${loc}`,
  }));

  const trustStripItems = getTrustStripItems(locale, messages);

  return (
    <html lang={locale}>
      <head>
        {alternates.map(({ hrefLang, href }) => (
          <link
            key={hrefLang}
            rel="alternate"
            hrefLang={hrefLang}
            href={href}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
      </head>
      <body className={geist.className}>
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <CartProvider cart={cart}>
            <TrustStrip items={trustStripItems} />
            <Navbar />
            {children}
            <Footer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
