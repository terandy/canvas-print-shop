import Stripe from "stripe";

// Allow build to pass without STRIPE_SECRET_KEY for static generation
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Preserve the API contract used by existing custom orders and order reads.
// Stripe only types its latest version, but supports these explicit versions.
const legacyOptions = {
  apiVersion: "2025-12-15.clover" as Stripe.LatestApiVersion,
};
const checkoutOptions = {
  apiVersion: "2026-03-25.dahlia" as Stripe.LatestApiVersion,
};

function getStripe(): Stripe {
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(stripeSecretKey, legacyOptions);
}

// Lazy initialization to avoid build-time errors
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, legacyOptions)
  : (new Proxy({} as Stripe, {
      get() {
        throw new Error("STRIPE_SECRET_KEY is not set");
      },
    }) as Stripe);

export { getStripe };

// The Checkout Form requires Dahlia. Keep this upgrade scoped to standard
// checkout rather than changing the API version of every existing Stripe call.
export const checkoutStripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, checkoutOptions)
  : stripe;
