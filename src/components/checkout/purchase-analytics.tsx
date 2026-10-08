"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PurchaseEvent } from "@/lib/analytics/purchase";

export function PurchaseAnalytics({ event }: { event: PurchaseEvent }) {
  useEffect(() => {
    const key = `cps-ga4-purchase-${event.transaction_id}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
    } catch {
      // Tracking can still run when browser storage is unavailable.
    }

    let attempts = 0;
    const send = () => {
      const gtag = (
        window as Window & {
          gtag?: (
            command: string,
            name: string,
            params: PurchaseEvent
          ) => void;
        }
      ).gtag;
      if (!gtag) return false;
      gtag("event", "purchase", event);
      try {
        window.sessionStorage.setItem(key, "sent");
      } catch {
        // GA4 also deduplicates web purchases by transaction_id.
      }
      return true;
    };
    if (send()) return;
    const timer = window.setInterval(() => {
      attempts++;
      if (send() || attempts >= 25) window.clearInterval(timer);
    }, 400);
    return () => window.clearInterval(timer);
  }, [event]);
  return null;
}

export function RefreshPendingOrder() {
  const router = useRouter();
  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts++;
      if (attempts > 20) {
        window.clearInterval(timer);
        return;
      }
      router.refresh();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [router]);
  return null;
}
