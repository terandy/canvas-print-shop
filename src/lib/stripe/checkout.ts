import { getTranslations } from "next-intl/server";
import type Stripe from "stripe";
import { stripe, checkoutStripe } from "./index";
import * as cartDb from "@/lib/db/queries/carts";
import { BASE_URL } from "@/lib/constants";
import { BUSINESS_DATA } from "@/lib/business-data";
import {
  SHIPPING_PRICING_VERSION,
  assessAutomaticDelivery,
  getShippingRateCents,
  isDeliveryProvince,
  normalizeCanadianRegion,
  parseShippingBand,
  type CanadianRegionCode,
  type DeliveryQuoteEvidence,
  type ShippingBand,
} from "@/lib/shipping/pricing";

/** Stable keys stored on the order, and used as the Checkout metadata values
 *  the webhook reads back. Not user-facing — the labels come from next-intl. */
export const PICKUP_LOCATION_KEYS = {
  quebecCityWorkshop: "quebec-city",
  montrealBranch: "montreal",
} as const;

export type PickupLocationKey =
  (typeof PICKUP_LOCATION_KEYS)[keyof typeof PICKUP_LOCATION_KEYS];

export type FulfilmentChoice = {
  fulfilmentMethod: "delivery" | "pickup";
  pickupLocation: PickupLocationKey | null;
};

export type ResolvedCheckoutShipping = FulfilmentChoice & {
  shippingAmountCents: number | null;
  deliveryQuote: DeliveryQuoteEvidence | null;
};

export type CheckoutShippingDetails = {
  name: string;
  address: {
    country: "CA";
    line1: string;
    line2?: string;
    city?: string;
    postal_code: string;
    state: CanadianRegionCode;
  };
};

type ShippingOption = Stripe.Checkout.SessionCreateParams.ShippingOption;

function deliveryEstimate() {
  return {
    minimum: {
      unit: "business_day" as const,
      value:
        BUSINESS_DATA.productionAndDelivery.orderToDeliveryBusinessDays.min,
    },
    maximum: {
      unit: "business_day" as const,
      value:
        BUSINESS_DATA.productionAndDelivery.orderToDeliveryBusinessDays.max,
    },
  };
}

/**
 * Zero-rated collection options, one per location flagged `localPickup`.
 *
 * Stripe Checkout has no first-class pickup mode, so collection is modelled as
 * a $0 shipping rate. The rate carries metadata rather than relying on its
 * display name, which is localised and would otherwise have to be parsed back.
 */
export async function buildPickupOptions(
  locale: string
): Promise<ShippingOption[]> {
  const t = await getTranslations({ locale, namespace: "Checkout.fulfilment" });

  return (
    Object.entries(BUSINESS_DATA.locations) as [
      keyof typeof PICKUP_LOCATION_KEYS,
      (typeof BUSINESS_DATA.locations)[keyof typeof BUSINESS_DATA.locations],
    ][]
  )
    .filter(([, location]) => location.localPickup === true)
    .map(
      ([key]): ShippingOption => ({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "cad" },
          display_name: t(`pickup.${PICKUP_LOCATION_KEYS[key]}`),
          delivery_estimate: deliveryEstimate(),
          metadata: {
            fulfilmentMethod: "pickup",
            pickupLocation: PICKUP_LOCATION_KEYS[key],
          },
        },
      })
    );
}

export async function buildDeliveryOption(
  shippingCost: number,
  locale: string,
  quote?: { province: string; band: ShippingBand }
): Promise<ShippingOption> {
  const t = await getTranslations({ locale, namespace: "Checkout.fulfilment" });

  return {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: shippingCost, currency: "cad" },
      display_name: t("delivery"),
      delivery_estimate: deliveryEstimate(),
      metadata: {
        fulfilmentMethod: "delivery",
        ...(quote
          ? {
              shippingProvince: quote.province,
              shippingBand: quote.band,
              shippingPricingVersion: SHIPPING_PRICING_VERSION,
            }
          : {}),
      },
    },
  };
}

async function buildLegacyShippingOptions(
  shippingCost: number,
  locale: string
): Promise<ShippingOption[]> {
  return [
    await buildDeliveryOption(shippingCost, locale),
    ...(await buildPickupOptions(locale)),
  ];
}

/**
 * Which option the customer actually chose. The webhook event carries only the
 * shipping rate's id, so the session is re-read with that rate expanded.
 * Lookup failures must reach the webhook so Stripe can retry before an order
 * is written. Only successfully read legacy rates may default to delivery.
 */
export async function resolveCheckoutShipping(
  sessionId: string
): Promise<ResolvedCheckoutShipping> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["shipping_cost.shipping_rate"],
  });
  const rate = session.shipping_cost?.shipping_rate;
  if (typeof rate === "string") {
    throw new Error("Checkout shipping rate was not expanded");
  }
  const metadata = rate?.metadata;

  if (metadata?.fulfilmentMethod === "pickup") {
    const location = metadata.pickupLocation as PickupLocationKey;
    if (!Object.values(PICKUP_LOCATION_KEYS).includes(location)) {
      throw new Error("Checkout pickup location is invalid");
    }
    return {
      fulfilmentMethod: "pickup",
      pickupLocation: location,
      shippingAmountCents: session.shipping_cost?.amount_total ?? null,
      deliveryQuote: null,
    };
  }
  if (metadata?.fulfilmentMethod && metadata.fulfilmentMethod !== "delivery") {
    throw new Error("Checkout fulfilment method is invalid");
  }

  const province = normalizeCanadianRegion(metadata?.shippingProvince);
  const band = parseShippingBand(metadata?.shippingBand);
  const deliveryQuote =
    province &&
    isDeliveryProvince(province) &&
    band &&
    metadata?.shippingPricingVersion
      ? {
          province,
          band,
          pricingVersion: metadata.shippingPricingVersion,
        }
      : null;

  return {
    fulfilmentMethod: "delivery",
    pickupLocation: null,
    shippingAmountCents: session.shipping_cost?.amount_total ?? null,
    deliveryQuote,
  };
}

export async function resolveFulfilment(
  sessionId: string
): Promise<FulfilmentChoice> {
  const { fulfilmentMethod, pickupLocation } =
    await resolveCheckoutShipping(sessionId);
  return { fulfilmentMethod, pickupLocation };
}

export const HOSTED_CHECKOUT_FLOW = "hosted-v1";

export function buildCheckoutLineItems(
  cart: NonNullable<Awaited<ReturnType<typeof cartDb.getCart>>>
) {
  return cart.items.map((item) => {
    // Build description from selected options
    const optionsDescription = Object.entries(item.selectedOptions)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    return {
      price_data: {
        currency: "cad",
        product_data: {
          name: item.productTitle,
          description: `${item.variantTitle}${optionsDescription ? ` (${optionsDescription})` : ""}`,
          images: item.attributes.imageUrl ? [item.attributes.imageUrl] : [],
          metadata: {
            variantId: item.variantId,
            productHandle: item.productHandle,
            borderStyle: item.attributes.borderStyle || "",
            orientation: item.attributes.orientation || "",
            imageUrl: item.attributes.imageUrl || "",
          },
        },
        unit_amount: item.priceCents,
      },
      quantity: item.quantity,
    };
  });
}

/** Hosted payments receive an immutable delivery destination before redirect.
 * Read it from the PaymentIntent, never from an editable billing address. */
export async function resolveCheckoutAddress(session: Stripe.Checkout.Session) {
  if (session.metadata?.checkoutFlow !== HOSTED_CHECKOUT_FLOW) {
    const legacy = session as Stripe.Checkout.Session & {
      shipping_details?: Stripe.Checkout.Session.CollectedInformation.ShippingDetails;
      shipping?: Stripe.Checkout.Session.CollectedInformation.ShippingDetails;
    };
    return (
      legacy.shipping_details ||
      session.collected_information?.shipping_details ||
      legacy.shipping
    );
  }
  if (session.metadata.fulfilmentMethod === "pickup") return undefined;
  if (
    session.metadata.fulfilmentMethod !== "delivery" ||
    !session.payment_intent
  ) {
    throw new Error("Hosted checkout delivery evidence is missing");
  }
  const intent =
    typeof session.payment_intent === "string"
      ? await stripe.paymentIntents.retrieve(session.payment_intent)
      : session.payment_intent;
  if (
    !intent.shipping?.name ||
    !intent.shipping.address?.line1 ||
    !intent.shipping.address.city
  ) {
    throw new Error("Hosted checkout delivery address is missing");
  }
  return intent.shipping;
}

export async function createCheckoutSession(cartId: string, locale: string) {
  const cart = await cartDb.getCart(cartId);

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const deliveryAssessment = assessAutomaticDelivery(cart);
  if (!deliveryAssessment.eligible) {
    throw new Error(`Invalid checkout cart: ${deliveryAssessment.reason}`);
  }

  const lineItems = buildCheckoutLineItems(cart);

  // Start with pickup only. Once Stripe has a complete Canadian address, the
  // server callback adds the applicable delivery rate. This prevents a cheap
  // placeholder delivery rate from ever being payable.
  const session = await checkoutStripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    ui_mode: "form",
    return_url: `${BASE_URL}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    shipping_address_collection: {
      allowed_countries: ["CA"],
    },
    shipping_options: await buildPickupOptions(locale),
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    metadata: {
      cartId,
      locale,
      shippingPricingVersion: SHIPPING_PRICING_VERSION,
      automaticDelivery: "true",
      shippingBand: deliveryAssessment.profile.band,
    },
    locale: locale === "fr" ? "fr-CA" : "en",
  });

  return session;
}

/**
 * Reprice an open embedded Checkout Session after Stripe collects an address.
 * The cart's delivery band is server-authored session metadata, so changing a
 * browser payload cannot change the eligible product or size.
 */
export async function updateCheckoutShipping(params: {
  sessionId: string;
  cartId: string;
  shippingDetails: CheckoutShippingDetails;
}): Promise<{ automaticDelivery: boolean }> {
  const session = await checkoutStripe.checkout.sessions.retrieve(
    params.sessionId
  );
  if (
    session.status !== "open" ||
    session.ui_mode !== "form" ||
    session.metadata?.cartId !== params.cartId ||
    session.metadata?.shippingPricingVersion !== SHIPPING_PRICING_VERSION
  ) {
    throw new Error("Checkout session cannot be updated");
  }

  const locale = session.metadata.locale === "fr" ? "fr" : "en";
  const province = params.shippingDetails.address.state;
  const band = parseShippingBand(session.metadata.shippingBand);
  if (session.metadata.automaticDelivery !== "true" || !band) {
    throw new Error("Checkout shipping band is invalid");
  }
  const automaticDelivery =
    session.metadata.automaticDelivery === "true" &&
    band !== null &&
    isDeliveryProvince(province);

  const shippingOptions = await buildPickupOptions(locale);
  if (automaticDelivery) {
    shippingOptions.unshift(
      await buildDeliveryOption(getShippingRateCents(province, band), locale, {
        province,
        band,
      })
    );
  }

  // The Form SDK owns address collection; only rates are updated server-side.
  await checkoutStripe.checkout.sessions.update(params.sessionId, {
    shipping_options: shippingOptions,
  });

  return { automaticDelivery };
}

// Create a checkout session for a custom order (no cart required)
export async function createCustomCheckoutSession(params: {
  description: string;
  priceCents: number;
  shippingCents: number;
  customerEmail: string;
  locale: string;
  customSize?: string;
  imageUrl?: string;
}) {
  const {
    description,
    priceCents,
    shippingCents,
    customerEmail,
    locale,
    customSize,
    imageUrl,
  } = params;

  const productDescription = customSize
    ? `Custom size: ${customSize}`
    : "Custom order";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: description,
            description: productDescription,
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${BASE_URL}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/${locale}/checkout/cancelled`,
    shipping_address_collection: {
      allowed_countries: ["CA", "US"],
    },
    shipping_options: await buildLegacyShippingOptions(shippingCents, locale),
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    customer_email: customerEmail,
    metadata: {
      isCustomOrder: "true",
      description,
      customSize: customSize || "",
      imageUrl: imageUrl || "",
      locale,
    },
    locale: locale === "fr" ? "fr-CA" : "en",
  });

  return session;
}

// Retrieve checkout session (for success page)
export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "customer", "payment_intent"],
  });

  return session;
}
