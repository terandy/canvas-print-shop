import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { noIndexMetadata } from "@/lib/seo";
import NotFound from "./[locale]/not-found";
import "./[locale]/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound");
  return { title: t("heading"), ...noIndexMetadata };
}

// Vercel's routing-level 404 fallback bypasses the dynamic locale layout.
// Keep its document localized without depending on the storefront providers.
export default async function GlobalNotFound() {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <NotFound />
      </body>
    </html>
  );
}
