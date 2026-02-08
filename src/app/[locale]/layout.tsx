import type { Metadata } from "next";
import "./globals.css";
import { cookies, headers } from "next/headers";
import { getCart } from "@/lib/db/queries/carts";
import { Navbar, Footer, TrustStrip } from "@/components";
import { CartProvider } from "@/contexts";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { Geist } from "next/font/google";
import GoogleAnalytics from "@/components/google-analytics";
import HubSpotScript from "@/components/hubspot-script";

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
  happiness: string;
};

const TRUST_STRIP_FALLBACK: Record<string, TrustStripCopy> = {
  en: {
    madeInCanada: "Made in Quebec",
    happiness: "100% happiness guarantee",
  },
  fr: {
    madeInCanada: "Fabriqué au Québec",
    happiness: "Garantie bonheur 100 %",
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
    happiness: trustStrip.happiness ?? fallback.happiness,
  };

  return [
    { text: resolved.madeInCanada, includeLeaves: true },
    { text: resolved.happiness },
  ];
};

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

const LocaleLayout = async ({ children, params }: Props) => {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminRoute = pathname.includes("/admin");

  const cookiesStore = await cookies();
  const cartId = cookiesStore.get("cartId")?.value;
  const cart = !isAdminRoute && cartId ? await getCart(cartId) : undefined;

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

  // Admin pages get a minimal layout without navbar/footer
  if (isAdminRoute) {
    return (
      <html lang={locale}>
        <head>
          <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
        </head>
        <body className={geist.className}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    );
  }

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
        <HubSpotScript />
      </body>
    </html>
  );
};

export default LocaleLayout;
