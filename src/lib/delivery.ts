import { addBusinessDays } from "@/lib/utils/base";
import { BUSINESS_DATA } from "@/lib/business-data";

/**
 * Single source of truth for delivery timing.
 *
 * These numbers back the "get it by" estimate on the product page and every
 * delivery claim in the marketing copy. Keep them here rather than inline —
 * the landing pages previously carried hand-written per-city day counts that
 * did not match what the product page actually promised.
 *
 * The window covers production plus transit, end to end.
 */
export const DELIVERY_MIN_BUSINESS_DAYS =
  BUSINESS_DATA.productionAndDelivery.orderToDeliveryBusinessDays.min;
export const DELIVERY_MAX_BUSINESS_DAYS =
  BUSINESS_DATA.productionAndDelivery.orderToDeliveryBusinessDays.max;

/**
 * The estimated delivery window for an order placed on `from`.
 *
 * Note this is deliberately uniform across our Quebec and Ontario delivery
 * area — we do not quote faster times for closer cities, because production
 * scheduling dominates the total and transit differences are within the noise
 * of this window.
 */
export const getDeliveryEstimate = (from: Date = new Date()) => ({
  earliest: addBusinessDays(from, DELIVERY_MIN_BUSINESS_DAYS),
  latest: addBusinessDays(from, DELIVERY_MAX_BUSINESS_DAYS),
});

/** e.g. "Mon, 04 Aug - Fri, 08 Aug" */
export const formatDeliveryRange = (
  locale: string,
  from: Date = new Date()
): string => {
  const { earliest, latest } = getDeliveryEstimate(from);
  const format = (date: Date) =>
    date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      weekday: "short",
    });
  return `${format(earliest)} - ${format(latest)}`;
};
