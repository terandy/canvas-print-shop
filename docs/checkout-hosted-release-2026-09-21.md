# Hosted checkout restoration — 21 September 2026

The standard checkout now reviews delivery/pickup and the total on the shop, then redirects to Stripe-hosted Checkout. This replaces the embedded Form entry point while preserving province-size shipping prices and legacy checkout/custom-order processing.

## Shipping and payment behavior

- Delivery is the initial visible choice. Selecting a province immediately displays the order's largest-size shipping rate. Montreal and Quebec City pickup are free and require no delivery address.
- The server validates the destination's province/postal code, recomputes the amount, and rejects a cart that changed since review. The customer cannot submit their own shipping price.
- Hosted Checkout receives one fixed shipping rate and, for delivery, `payment_intent_data.shipping`. It does not collect a second editable shipping destination. The selected destination is shown above Stripe's Pay button.
- The webhook reads that fixed PaymentIntent address, requires paid status for the new flow, and runs the existing shipping evidence/price checks before creating an order. A shipping lookup failure returns 500 for Stripe retry.
- The existing embedded actions remain for sessions already open during the release; custom-order links remain on their existing integration.
- Standard hosted session creation uses a 15-second Stripe request timeout with at most one network retry. The form preserves the cart and shows a retry/contact path on failure.
- Apple Pay was already enabled on the Stripe account. Google Pay was enabled on its existing default configuration on 21 September; both subsequently reported available. The hosted session's Stripe WebMCP order summary reported card, Apple Pay and Google Pay. Wallet display still depends on customer device/browser eligibility.
- Removed unsupported Interac and Shop Pay footer logos. Kept enabled card/Apple Pay/Google Pay logos.

## Verification

- 102 automated tests passed; one database-only test skipped. Lint and TypeScript passed.
- Production build passed (requires network access for existing Google Fonts/static generation).
- New regression coverage includes fixed delivery pricing/address, both pickups in both languages, address and price tampering, stale carts, server-action error recovery, missing delivery evidence, unpaid events, webhook retries, delivery destination mismatch and both notifications.
- Isolated browser fixture uses the real component/server action/session builder with a synthetic five-canvas cart (subtotal CAD 500), real Stripe unpaid sessions, no production cart/order writes and no email sends.
- Chrome: English Ontario delivery CAD 75 / total CAD 575; mismatched postcode rejected before creating a session; Stripe-hosted card form and Apple Pay loaded.
- Codex in-app browser: French Quebec delivery CAD 60 / total CAD 560 loaded successfully. This is the browser where the embedded Form previously stayed blank/timed out.
- French mobile layout checked at 390px. Quebec City pickup total CAD 500, with location/instructions shown on Stripe. English Montreal pickup also checked. Stripe's back link returned to the saved fixture cart.
- No payment submitted, no card details entered. No Stripe test-mode keys were available. Simulated paid webhook events verify the code path; they do not prove an actual charge, live order write or receipt delivery.

## Release and recovery

Released from a clean worktree based on production commit `791cd4628db4056dcc172bd43d6698a1e278eaad`; unrelated local work was excluded. The previous province/size price table was not changed. GitHub/Vercel release IDs and live verification are recorded in the task response.

To recover the previous checkout, revert only this release commit and redeploy; the Google Pay account setting is independent and can remain enabled. Do not revert the earlier shipping-pricing release.

Reference: [Stripe Checkout session creation](https://docs.stripe.com/api/checkout/sessions/create). Hosted Checkout cannot dynamically customize shipping options after address changes; shipping is therefore validated before redirect.
