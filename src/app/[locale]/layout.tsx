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
import { BASE_URL, EMAIL, PHONE, ADDRESS } from "@/lib/constants";
import GoogleAnalytics from "@/components/google-analytics";
import HubSpotScript from "@/components/hubspot-script";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Custom Canvas Prints & Framing | Canvas Print Shop",
    template: "%s | Canvas Print Shop",
  },
  description:
    "Transform your photos into high-quality canvas prints. Expert hand-crafted in Quebec, Canada with premium materials and UVgel technology. Free shipping available.",
  icons: {
    icon: "/favicon.svg",
  },
  // NOTE: no `alternates` here on purpose. Metadata is inherited by every child
  // route, so a canonical set at the layout level made every page on the site
  // declare the homepage as its canonical. Each page sets its own via
  // `canonicalMetadata()` in `@/lib/seo`.
  openGraph: {
    type: "website",
    siteName: "Canvas Print Shop",
    url: BASE_URL,
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
  // getCart will return undefined for invalid cart IDs (e.g., old Shopify IDs)
  const cart = !isAdminRoute && cartId ? await getCart(cartId) : undefined;

  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  const trustStripItems = getTrustStripItems(locale, messages);

  // Admin pages get a minimal layout without navbar/footer
  if (isAdminRoute) {
    return (
      <html lang={locale}>
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
      {/*
        hreflang is no longer hand-rolled here. It used to point every page at
        the locale *root*, so /en/faqs claimed /fr as its French equivalent.
        Each page now emits correct per-path alternates via `canonicalMetadata()`.
      */}
      <body className={geist.className}>
        <GoogleAnalytics />
        <script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": `${BASE_URL}/#organization`,
              name: "Canvas Print Shop",
              url: BASE_URL,
              logo: `${BASE_URL}/favicon.svg`,
              image: `${BASE_URL}/canvas-example.jpeg`,
              email: EMAIL.label,
              telephone: PHONE.label,
              address: {
                "@type": "PostalAddress",
                streetAddress: "1172 Av. du Lac-Saint-Charles",
                addressLocality: "Québec",
                addressRegion: "QC",
                postalCode: "G3G 2S7",
                addressCountry: "CA",
              },
              hasMap: ADDRESS.href,
              // We only ship to Quebec and Ontario — declaring it keeps us out
              // of local results for provinces we cannot serve.
              areaServed: [
                { "@type": "State", name: "Quebec" },
                { "@type": "State", name: "Ontario" },
              ],
              knowsLanguage: ["en-CA", "fr-CA"],
              priceRange: "$$",
              sameAs: [],
            }),
          }}
        />
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
