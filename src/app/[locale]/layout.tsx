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

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Canvas Print Shop",
  description: "Create your own custom decor",
  icons: {
    icon: "/favicon.svg",
  },
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const LocaleLayout: React.FC<Props> = async ({ children, params }) => {
  const cookiesStore = await cookies();
  const cartId = cookiesStore.get("cartId")?.value;
  const cart = await getCart(cartId);

  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={geist.className}>
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
