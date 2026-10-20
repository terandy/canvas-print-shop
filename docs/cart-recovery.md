# Manual cart recovery

The customer can expand **Want a reminder?** in their cart, enter an email
address, and explicitly request a reminder. This saves the address and language
without sending an email.

In **Admin → Carts → Review cart**, staff can see the original artwork, variant,
border, orientation, quantity and current subtotal, preview the email in the
customer's language, and select **Send recovery email**.

Sending requires a populated, available, unexpired cart with no associated
order, explicit reminder permission and at least one hour without cart
activity. Another attempt is blocked for 24 hours, including uncertain provider
responses. The admin page records the last attempt and last confirmed provider
acceptance; acceptance does not mean inbox delivery.

Existing anonymous carts do not gain an email address retrospectively.
Customer records alone are not treated as permission. There is no automatic
campaign, scheduled email, discount or bulk-send operation.

## Links and checkout

- Recovery and unsubscribe links have separate random 256-bit tokens; only
  their hashes are stored.
- Recovery links expire after seven days and stop working when the cart
  expires, becomes unavailable, is ordered, changes recipient, or the address
  unsubscribes.
- Opening a link shows a confirmation page. Only a same-origin form POST sets
  the cart cookie, then redirects to the existing localised checkout. Email
  scanners do not change cart state.
- The original cart is reopened with its existing artwork and configuration.
  Current item prices are recalculated; the customer chooses delivery or
  pickup through the existing checkout. Old Stripe sessions are not reused.
- Token pages have no analytics or third-party scripts, cannot be cached or
  framed, and use `strict-origin` so referrer paths and tokens are stripped
  while legitimate form POSTs retain their Origin.
- Unsubscribe tokens remain valid after recovery expiry. Suppression applies
  to the email address across all carts and does not affect order emails.

## Release

This change is prepared locally. The production migration and deployment
require release approval; no customer messages were sent during development.

Apply `drizzle/0003_cart_recovery.sql` before deploying this code, since the
admin list now joins the recovery-contact table. It creates three new tables
without changing existing customer, order or cart records. The migration is
safe to rerun. With the intended database environment configured, the
repository's existing runner is:

```sh
node --import tsx scripts/apply-migration.ts drizzle/0003_cart_recovery.sql
```

Do not run `drizzle-kit migrate` against the existing unbaselined production
database; see the warning in `scripts/apply-migration.ts`.

Sending uses the existing `RESEND_API_KEY`, `ORDER_EMAIL`, reply address and
`NEXT_PUBLIC_BASE_URL`. No new secret is needed. Verify the production base URL
and sender configuration before the first manually approved customer send.

Rolling the application back leaves these additive tables harmlessly in place.

## Verification

- `npm test`: isolated tests mock email and other external services.
- `CPS_TEST_DATABASE_URL=postgres://.../cps_regression npm test`: the database
  tests require localhost and exercise migration retries, simultaneous claims,
  artwork preservation, changed recipients, expiry, ordered carts and
  suppression. The existing 2,800-empty-cart pagination regression still
  verifies one query per page.
- `npm run tsc -- --noEmit --incremental false`
- `npm run lint`
- `npm run build -- --webpack`

Browser checks use a separate temporary app copy, fictional carts in a
disposable local PostgreSQL instance, and an email stub that writes only to a
local file. Those fixture adapters and credentials are not part of this change.

The production build succeeds without live credentials, with the existing
missing-database sitemap fallback warning. Production email delivery remains
unverified until an explicitly approved send.
