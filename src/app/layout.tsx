import type { Metadata } from "next";
import "./globals.css";

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

const RootLayout: React.FC<Props> = async ({ children, params }) => {
  return (
    <html>
      <body className={geist.className}>{children}</body>
    </html>
  );
};

export default RootLayout;
