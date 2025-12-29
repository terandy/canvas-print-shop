import Stripe from "stripe";

// Allow build to pass without STRIPE_SECRET_KEY for static generation
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

function getStripe(): Stripe {
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(stripeSecretKey);
}

// Lazy initialization to avoid build-time errors
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : (new Proxy({} as Stripe, {
      get() {
        throw new Error("STRIPE_SECRET_KEY is not set");
      },
    }) as Stripe);

export { getStripe };
