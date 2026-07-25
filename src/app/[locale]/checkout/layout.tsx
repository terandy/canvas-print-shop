import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

/**
 * Checkout success/cancelled pages must never be indexed — they are
 * per-order, thin, and were previously fully crawlable because the
 * robots.txt rules did not account for the locale prefix.
 */
export const metadata: Metadata = noIndexMetadata;

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
