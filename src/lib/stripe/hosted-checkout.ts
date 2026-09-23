import { createHash } from "node:crypto";
import { getTranslations } from "next-intl/server";
import { stripe } from "./index";
import {
  buildCheckoutLineItems,
  buildDeliveryOption,
  buildPickupOptions,
  HOSTED_CHECKOUT_FLOW,
} from "./checkout";
import {
  SHIPPING_PRICING_VERSION,
  assessAutomaticDelivery,
  DELIVERY_PROVINCE_CODES,
  getShippingRateCents,
} from "@/lib/shipping/pricing";
import {
  hostedCheckoutSchema,
  type HostedCheckoutSummary,
} from "@/lib/shipping/hosted-checkout";
import type { Cart } from "@/types/cart";
import * as cartDb from "@/lib/db/queries/carts";
import { BASE_URL } from "@/lib/constants";

// Temporary five-use code for live checkout QA. Remove this path after the
// delivery tests and deactivate the Stripe promotion code.
const QA_PROMOTION_CODE_ID = "promo_1UIweyKfgVVDSs6asCvCXrrW";

export function getHostedCheckoutSummary(cart: Cart): HostedCheckoutSummary {
  const assessment = assessAutomaticDelivery(cart);
  if (!assessment.eligible) throw new Error("Checkout cart cannot be priced");
  const items = [...cart.items].sort((a, b) => a.id.localeCompare(b.id));
  return {
    fingerprint: createHash("sha256")
      .update(JSON.stringify({ version: SHIPPING_PRICING_VERSION, items }))
      .digest("hex"),
    subtotalCents: items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    ),
    rates: Object.fromEntries(
      DELIVERY_PROVINCE_CODES.map((province) => [
        province,
        getShippingRateCents(province, assessment.profile.band),
      ])
    ),
    items: items.map((item) => ({
      id: item.id,
      title: item.productTitle,
      variant: item.variantTitle,
      quantity: item.quantity,
      totalCents: item.quantity * item.priceCents,
    })),
  };
}

export async function createHostedCheckoutSession(
  cartId: string,
  locale: "en" | "fr",
  input: unknown,
  expectedFingerprint: string
) {
  const fulfilment = hostedCheckoutSchema.parse(input);
  const cart = await cartDb.getCart(cartId);
  if (!cart || !cart.items.length) throw new Error("empty-cart");
  const summary = getHostedCheckoutSummary(cart);
  if (summary.fingerprint !== expectedFingerprint)
    throw new Error("cart-changed");
  const assessment = assessAutomaticDelivery(cart);
  if (!assessment.eligible) throw new Error("Invalid checkout cart");
  let qaPromotionCodeId: string | undefined;
  if (fulfilment.method === "delivery" && fulfilment.promotionCode) {
    const promotion = await stripe.promotionCodes.retrieve(QA_PROMOTION_CODE_ID);
    if (
      !promotion.active ||
      promotion.code.toUpperCase() !==
        fulfilment.promotionCode.toUpperCase() ||
      (promotion.expires_at !== null &&
        promotion.expires_at * 1000 <= Date.now()) ||
      (promotion.max_redemptions !== null &&
        promotion.times_redeemed >= promotion.max_redemptions)
    ) {
      throw new Error("invalid-code");
    }
    qaPromotionCodeId = promotion.id;
  }
  const t = await getTranslations({ locale, namespace: "Checkout.hosted" });
  const shippingOption =
    fulfilment.method === "delivery"
      ? await buildDeliveryOption(
          qaPromotionCodeId
            ? 0
            : summary.rates[fulfilment.shipping.address.state],
          locale,
          {
            province: fulfilment.shipping.address.state,
            band: assessment.profile.band,
            ...(qaPromotionCodeId
              ? { waiverPromotionCodeId: qaPromotionCodeId }
              : {}),
          }
        )
      : (await buildPickupOptions(locale)).find(
          (option) =>
            option.shipping_rate_data?.metadata?.pickupLocation ===
            fulfilment.location
        );
  if (!shippingOption) throw new Error("Invalid pickup location");
  const shipping =
    fulfilment.method === "delivery" ? fulfilment.shipping : undefined;
  const summaryText = shipping
    ? t("deliverySummary", {
        address: [
          shipping.name,
          shipping.address.line1,
          shipping.address.line2,
          shipping.address.city,
          shipping.address.state,
          shipping.address.postal_code,
        ]
          .filter(Boolean)
          .join(", "),
      })
    : t("pickupSummary", {
        location: shippingOption.shipping_rate_data!.display_name,
      });
  return stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      mode: "payment",
      ...(!qaPromotionCodeId ? { allow_promotion_codes: true } : {}),
      ...(qaPromotionCodeId
        ? { discounts: [{ promotion_code: qaPromotionCodeId }] }
        : {}),
      // Omit ui_mode to use Stripe's stable hosted default on the existing API.
      line_items: buildCheckoutLineItems(cart),
      success_url: `${BASE_URL}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/${locale}/checkout`,
      shipping_options: [shippingOption],
      // The destination was confirmed before redirect. Collecting a second
      // shipping address here could undercharge if a buyer changed provinces.
      ...(shipping && !qaPromotionCodeId
        ? { payment_intent_data: { shipping } }
        : {}),
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      custom_text: { submit: { message: summaryText } },
      metadata: {
        cartId,
        locale,
        checkoutFlow: HOSTED_CHECKOUT_FLOW,
        fulfilmentMethod: fulfilment.method,
        shippingPricingVersion: SHIPPING_PRICING_VERSION,
        shippingBand: assessment.profile.band,
        automaticDelivery: "true",
        ...(qaPromotionCodeId && shipping
          ? {
              qaShippingWaiverCodeId: qaPromotionCodeId,
              qaShippingName: shipping.name,
              qaShippingLine1: shipping.address.line1,
              qaShippingLine2: shipping.address.line2 || "",
              qaShippingCity: shipping.address.city,
              qaShippingState: shipping.address.state,
              qaShippingPostalCode: shipping.address.postal_code,
            }
          : {}),
      },
      locale: locale === "fr" ? "fr-CA" : "en",
    },
    { timeout: 15000, maxNetworkRetries: 1 }
  );
}
