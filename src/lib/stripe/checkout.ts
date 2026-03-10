import { stripe } from "./index";
import * as cartDb from "@/lib/db/queries/carts";
import { BASE_URL } from "@/lib/constants";

// Calculate shipping cost based on canvas dimensions
function calculateShippingCost(
  cart: Awaited<ReturnType<typeof cartDb.getCart>>
): number {
  if (!cart) return 1500; // Default $15

  let maxWidth = 0;
  let maxHeight = 0;

  for (const item of cart.items) {
    const size = item.selectedOptions.dimension || item.selectedOptions.size;
    if (size) {
      const [width, height] = size.split("x").map((s) => parseInt(s.trim()));
      if (width && height) {
        maxWidth = Math.max(maxWidth, width);
        maxHeight = Math.max(maxHeight, height);
      }
    }
  }

  const largestDimension = Math.max(maxWidth, maxHeight);

  if (largestDimension <= 12) {
    return 1500; // Small: $15 (up to 12")
  } else if (largestDimension <= 24) {
    return 2500; // Medium: $25 (13"-24")
  } else if (largestDimension <= 36) {
    return 3500; // Large: $35 (25"-36")
  } else {
    return 5000; // Extra Large: $50 (37"+)
  }
}

export async function createCheckoutSession(cartId: string, locale: string) {
  const cart = await cartDb.getCart(cartId);

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const shippingCost = calculateShippingCost(cart);

  // Build line items for Stripe
  const lineItems = cart.items.map((item) => {
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

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${BASE_URL}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/${locale}/checkout/cancelled`,
    shipping_address_collection: {
      allowed_countries: ["CA", "US"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: shippingCost,
            currency: "cad",
          },
          display_name: "Shipping",
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 3,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
    ],
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    metadata: {
      cartId,
      locale,
    },
    locale: locale === "fr" ? "fr-CA" : "en",
  });

  return session;
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
  const { description, priceCents, shippingCents, customerEmail, locale, customSize, imageUrl } = params;

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
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: shippingCents,
            currency: "cad",
          },
          display_name: "Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
    ],
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
