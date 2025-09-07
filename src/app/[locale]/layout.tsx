import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { getCart } from "@/lib/shopify";
import { Navbar, Footer } from "@/components";
import { CartProvider } from "@/contexts";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
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

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

const LocaleLayout = async ({ children, params }: Props) => {
  const cookiesStore = await cookies();
  const cartId = cookiesStore.get("cartId")?.value;
  const cart = await getCart(cartId);

  const { locale } = params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  const alternates = routing.locales.map((loc) => ({
    hrefLang: `${loc}-CA`, // e.g. en-CA, fr-CA
    href: `${BASE_URL}/${loc}`,
  }));

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
