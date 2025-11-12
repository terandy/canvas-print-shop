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

type TrustStripCopy = {
  madeInCanada: string;
  discount: string;
  happiness: string;
  holidayShipping: string;
};

const TRUST_STRIP_FALLBACK: Record<string, TrustStripCopy> = {
  en: {
    madeInCanada: "Made in Quebec",
    discount: "Use code GET10 for 10% off your order",
    happiness: "100% happiness guarantee",
    holidayShipping: "Order now to receive before Christmas",
  },
  fr: {
    madeInCanada: "Fabriqué au Québec",
    discount: "Utilisez le code GET10 pour obtenir 10 % de rabais",
    happiness: "Garantie bonheur 100 %",
    holidayShipping: "Commandez maintenant pour recevoir avant Noël",
  },
};

type TrustStripItem = {
  text: string;
  includeLeaves?: boolean;
};

const getTrustStripItems = (
  locale: string,
  messages: AbstractIntlMessages
): TrustStripItem[] => {
  const fallback =
    TRUST_STRIP_FALLBACK[locale as keyof typeof TRUST_STRIP_FALLBACK] ??
    TRUST_STRIP_FALLBACK.en;

  const trustStrip =
    (messages["trustStrip"] as Partial<TrustStripCopy> | undefined) ?? {};

  const resolved: TrustStripCopy = {
    madeInCanada: trustStrip.madeInCanada ?? fallback.madeInCanada,
    discount: trustStrip.discount ?? fallback.discount,
    happiness: trustStrip.happiness ?? fallback.happiness,
    holidayShipping: trustStrip.holidayShipping ?? fallback.holidayShipping,
  };

  return [
    { text: resolved.madeInCanada, includeLeaves: true },
    { text: resolved.discount },
    { text: resolved.happiness },
    { text: resolved.holidayShipping },
  ];
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
