import { stripe } from "./index";
import * as cartDb from "@/lib/db/queries/carts";
import { BASE_URL } from "@/lib/constants";

export async function createCheckoutSession(cartId: string, locale: string) {
  const cart = await cartDb.getCart(cartId);

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

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

// Retrieve checkout session (for success page)
export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "customer", "payment_intent"],
  });

  return session;
}
