import type { Metadata } from "next";
import "./globals.css";

import { cookies } from "next/headers";
import { getCart } from "@/lib/shopify";
import { Navbar, Footer } from "@/components";
import { CartProvider } from "@/contexts";
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
}

const RootLayout: React.FC<Props> = async ({ children }) => {
  const cookiesStore = await cookies();
  const cartId = cookiesStore.get("cartId")?.value;
  const cart = await getCart(cartId);
  return (
    <html lang="en">
      <body className={geist.className}>
        <CartProvider cart={cart}>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
};

export default RootLayout;
