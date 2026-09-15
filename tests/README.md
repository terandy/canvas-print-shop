# Regression checks

Run `npm test` for product selection, checkout fulfilment, pickup notification,
localisation, SEO and room visualiser checks. External services are mocked;
these tests do not create real orders or send emails.

## Checkout shipping browser check

`node --import tsx scripts/check-checkout-form.ts` runs an isolated fixture at
`http://localhost:3400/en` (or `/fr`) using the real checkout component and
server actions with a synthetic cart. It does not connect to the shop database
or expose a webhook. Stripe test keys are required by default. The explicit
`--allow-live-unpaid` flag allows an unpaid live-mode smoke check; never enter
card details or press Pay in that mode. Stop with Ctrl-C to expire the sessions.

The fixture contains two framed 30×40 canvases and three rolled 16×24 canvases:
Quebec shipping is $60; British Columbia shipping is $115; Montreal and Quebec
City pickup are $0. Territories show pickup only. Confirm address changes
refresh the shipping options, and check English and French. Full payment and
webhook integration testing must use a sandbox, never live card payments.

Also verify the actual populated `/en/checkout` and `/fr/checkout` routes in
Next.js after a full reload and by clicking Proceed to Checkout from the cart.
The fixture exercises React StrictMode, but does not replace the real Next.js
navigation check. The form's `data-checkout-load-ms` attribute measures SDK
startup through both rendered form and loaded actions; it excludes navigation.

The seed integration test uses the repository's actual database migration and
checks existing cart/order references, stable variant IDs, concurrent reruns,
and rollback after a SQL failure. It runs when `CPS_TEST_DATABASE_URL` is set,
and requires a local database named `cps_regression`.

With PostgreSQL installed, start a disposable instance from the repository root:

```sh
cpsPgDir=$(mktemp -d /tmp/cps-regression.XXXXXX)
initdb -D "$cpsPgDir/data" -U cps_test -A trust --no-locale -E UTF8
pg_ctl -D "$cpsPgDir/data" -l "$cpsPgDir/server.log" \
  -o "-h 127.0.0.1 -p 55639 -k $cpsPgDir" -w start
createdb -h 127.0.0.1 -p 55639 -U cps_test cps_regression
CPS_TEST_DATABASE_URL=postgres://cps_test@127.0.0.1:55639/cps_regression npm test
pg_ctl -D "$cpsPgDir/data" -m fast -w stop
```

The integration test creates and removes its own schema. It does not use
`POSTGRES_URL` or `.env.local`. The seed CLI also stays offline unless explicitly
run with `--apply`; applying it changes prices/options but preserves product copy,
activation, existing variant availability, and variant IDs.
