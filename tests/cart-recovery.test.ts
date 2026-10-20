import assert from "node:assert/strict";
import test from "node:test";
import { NextResponse } from "next/server";
import * as shared from "../src/lib/cart-recovery/shared";
import * as response from "../src/lib/cart-recovery/response";
import { renderCartRecoveryEmail } from "../src/lib/email/cart-recovery";
import * as business from "../src/lib/business-data";
import { loadModule } from "./helpers/load-module";
import en from "../messages/en.json";
import fr from "../messages/fr.json";

const id = "10000000-0000-4000-8000-000000000001";
const adminId = "10000000-0000-4000-8000-000000000002";
function cart(): shared.RecoveryCart {
  return {
    id,
    status: "active",
    hasOrder: false,
    updatedAt: new Date(Date.now() - 2 * shared.RECOVERY_IDLE_MS),
    expiresAt: new Date(Date.now() + shared.RECOVERY_LINK_MS),
    contact: {
      email: "buyer@example.test",
      locale: "en",
      suppressed: false,
      consentedAt: new Date("2026-10-01"),
      lastAttemptAt: null,
      lastSentAt: null,
    },
    items: [
      {
        id: "line-1",
        productTitle: "Canvas",
        productTitleFr: "Toile",
        variantTitle: "16×24 / Gallery",
        priceCents: 12500,
        quantity: 2,
        available: true,
        attributes: {
          imageUrl: "https://example.test/private-photo.jpg",
          orientation: "portrait",
          borderStyle: "wrapped",
        },
      },
    ],
  };
}

test("only inactive, available, opted-in carts can receive a recovery email", () => {
  assert.equal(shared.recoveryBlock(cart()), null);
  const cases: [shared.RecoveryBlock, (c: shared.RecoveryCart) => void][] = [
    [
      "unavailable",
      (c) => {
        c.status = "converted";
      },
    ],
    [
      "unavailable",
      (c) => {
        c.hasOrder = true;
      },
    ],
    [
      "unavailable",
      (c) => {
        c.items = [];
      },
    ],
    [
      "unavailable",
      (c) => {
        c.items[0].available = false;
      },
    ],
    [
      "unavailable",
      (c) => {
        c.expiresAt = new Date(0);
      },
    ],
    [
      "noEmail",
      (c) => {
        c.contact = null;
      },
    ],
    [
      "unsubscribed",
      (c) => {
        c.contact!.suppressed = true;
      },
    ],
    [
      "recentActivity",
      (c) => {
        c.updatedAt = new Date();
      },
    ],
    [
      "recentAttempt",
      (c) => {
        c.contact!.lastAttemptAt = new Date();
      },
    ],
  ];
  for (const [expected, edit] of cases) {
    const c = cart();
    edit(c);
    assert.equal(shared.recoveryBlock(c), expected);
  }
});

test("preview fingerprints change with recipient, locale, price, quantity and artwork", () => {
  const original = cart();
  const fingerprint = shared.recoveryFingerprint(original);
  for (const edit of [
    (c: shared.RecoveryCart) => {
      c.contact!.email = "changed@example.test";
    },
    (c: shared.RecoveryCart) => {
      c.contact!.locale = "fr";
    },
    (c: shared.RecoveryCart) => {
      c.items[0].priceCents++;
    },
    (c: shared.RecoveryCart) => {
      c.items[0].quantity++;
    },
    (c: shared.RecoveryCart) => {
      c.items[0].attributes.imageUrl = "https://example.test/different.jpg";
    },
  ]) {
    const c = structuredClone(original);
    edit(c);
    assert.notEqual(shared.recoveryFingerprint(c), fingerprint);
  }
});

test("tokens are unpredictable, hashed for storage and strictly validated", () => {
  const a = shared.createRecoveryToken();
  const b = shared.createRecoveryToken();
  assert.match(a.token, /^[a-f0-9]{64}$/);
  assert.notEqual(a.token, b.token);
  assert.notEqual(a.token, a.tokenHash);
  assert.equal(shared.hashRecoveryToken(a.token), a.tokenHash);
  for (const value of ["", id, "' OR true", "a".repeat(63), "a".repeat(65)])
    assert.equal(shared.recoveryTokenSchema.safeParse(value).success, false);
});

test("both email languages show the saved items, current subtotal, expiry, opt-out and escaped user data", () => {
  for (const locale of ["en", "fr"] as const) {
    const c = cart();
    c.contact!.locale = locale;
    c.items[0].variantTitle = '16×24 <img src=x onerror="alert(1)">';
    const result = renderCartRecoveryEmail(
      c,
      "https://example.test/recover?token=abc",
      "https://example.test/unsubscribe?token=xyz"
    );
    const t = (locale === "fr" ? fr : en).Email.cartRecovery;
    assert.equal(result.subject, t.subject);
    assert.ok(result.html.includes(locale === "fr" ? "Toile" : "Canvas"));
    assert.ok(result.html.includes("$250.00 CAD"));
    assert.ok(result.html.includes("https://example.test/recover?token=abc"));
    assert.ok(result.text.includes(t.unsubscribe));
    assert.ok(result.html.includes("&lt;img"));
    assert.ok(!result.html.includes("<img"));
    assert.ok(!result.html.includes("private-photo"));
    assert.ok(result.text.includes("7"));
  }
});

function harness(
  options: {
    authorized?: boolean;
    configured?: boolean;
    claim?: boolean;
    emailError?: boolean;
    throwSend?: boolean;
    throwRecord?: boolean;
    cart?: shared.RecoveryCart;
  } = {}
) {
  const c = options.cart ?? cart();
  let reads = 0;
  let claims = 0;
  let records = 0;
  const emails: any[] = [];
  const saved: any[] = [];
  const action = loadModule<
    typeof import("../src/lib/db/actions/cart-recovery")
  >("src/lib/db/actions/cart-recovery.ts", {
    "next/headers": { cookies: async () => ({ get: () => ({ value: id }) }) },
    "next-intl/server": { getLocale: async () => "fr" },
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/session": {
      getAdminSession: async () =>
        options.authorized === false
          ? null
          : { userId: adminId, role: "admin" },
    },
    "@/lib/cart-recovery/shared": shared,
    "@/lib/db/queries/cart-recovery": {
      getRecoveryCart: async () => {
        reads++;
        return c;
      },
      claimRecoverySend: async (
        _cart: unknown,
        admin: string,
        tokenHash: string,
        unsubscribeHash: string
      ) => {
        claims++;
        assert.equal(admin, adminId);
        assert.notEqual(tokenHash, unsubscribeHash);
        return options.claim === false
          ? null
          : { id: "delivery-1", email: c.contact!.email };
      },
      recordRecoverySent: async () => {
        if (options.throwRecord) throw new Error("database");
        records++;
      },
      saveRecoveryContact: async (...input: unknown[]) => {
        saved.push(input);
        return true;
      },
    },
    "@/lib/email/cart-recovery": { renderCartRecoveryEmail },
    "@/lib/email": {
      ORDER_EMAIL: "shop@example.test",
      resend:
        options.configured === false
          ? null
          : {
              emails: {
                send: async (payload: any, opts: any) => {
                  emails.push({ payload, opts });
                  if (options.throwSend) throw new Error("timeout");
                  return options.emailError
                    ? { error: { message: "rejected" }, data: null }
                    : { error: null, data: { id: "email-1" } };
                },
              },
            },
    },
    "@/lib/constants": { BASE_URL: "https://example.test" },
    "@/lib/business-data": business,
  });
  const form = new FormData();
  form.set("cartId", id);
  form.set("fingerprint", shared.recoveryFingerprint(c));
  return {
    action,
    form,
    emails,
    saved,
    stats: () => ({ reads, claims, records }),
  };
}

test("saving an email requires consent, normalizes it, uses the cookie cart and never sends", async () => {
  const h = harness();
  const form = new FormData();
  form.set("email", " Buyer@Example.test ");
  form.set("cartId", adminId);
  assert.equal(
    (await h.action.saveCartRecoveryEmail({}, form)).status,
    "invalid"
  );
  form.set("consent", "on");
  assert.equal(
    (await h.action.saveCartRecoveryEmail({}, form)).status,
    "saved"
  );
  assert.deepEqual(h.saved, [[id, "buyer@example.test", "fr"]]);
  assert.equal(h.emails.length, 0);
});

test("sending enforces authentication, configuration, eligibility, preview and atomic claim", async () => {
  const unauthorized = harness({ authorized: false });
  assert.equal(
    (await unauthorized.action.sendCartRecoveryEmail({}, unauthorized.form))
      .status,
    "unauthorized"
  );
  assert.equal(unauthorized.stats().reads, 0);
  const unconfigured = harness({ configured: false });
  assert.equal(
    (await unconfigured.action.sendCartRecoveryEmail({}, unconfigured.form))
      .status,
    "notConfigured"
  );
  const anonymous = cart();
  anonymous.contact = null;
  const noEmail = harness({ cart: anonymous });
  assert.equal(
    (await noEmail.action.sendCartRecoveryEmail({}, noEmail.form)).status,
    "noEmail"
  );
  const changed = harness();
  changed.form.set("fingerprint", "wrong");
  assert.equal(
    (await changed.action.sendCartRecoveryEmail({}, changed.form)).status,
    "changed"
  );
  assert.equal(changed.stats().claims, 0);
  const duplicate = harness({ claim: false });
  assert.equal(
    (await duplicate.action.sendCartRecoveryEmail({}, duplicate.form)).status,
    "changed"
  );
  assert.equal(duplicate.emails.length, 0);
});

test("only provider acceptance with durable recording reports sent; failures do not retry", async () => {
  const success = harness();
  assert.equal(
    (await success.action.sendCartRecoveryEmail({}, success.form)).status,
    "sent"
  );
  assert.equal(success.stats().records, 1);
  const email = success.emails[0];
  assert.equal(email.payload.to, "buyer@example.test");
  assert.equal(email.opts.idempotencyKey, "cart-recovery/delivery-1");
  assert.match(
    email.payload.text,
    /https:\/\/example.test\/api\/cart-recovery\?token=[a-f0-9]{64}/
  );
  for (const [options, expected] of [
    [{ emailError: true }, "sendFailed"],
    [{ throwSend: true }, "unconfirmed"],
    [{ throwRecord: true }, "unconfirmed"],
  ] as const) {
    const h = harness(options);
    assert.equal(
      (await h.action.sendCartRecoveryEmail({}, h.form)).status,
      expected
    );
    assert.equal(h.emails.length, 1);
    assert.equal(h.stats().records, 0);
  }
});

test("recovery GET is inert and private; POST requires same origin and revalidates before restoring the cookie", async () => {
  let valid = true;
  let reads = 0;
  const token = shared.createRecoveryToken().token;
  const route = loadModule<typeof import("../src/app/api/cart-recovery/route")>(
    "src/app/api/cart-recovery/route.ts",
    {
      "next/server": { NextResponse },
      "@/lib/db/queries/cart-recovery": {
        getRecoveryLink: async () => {
          reads++;
          return valid ? { cart: cart(), link: { locale: "fr" } } : null;
        },
      },
      "@/lib/cart-recovery/response": response,
    }
  );
  const get = await route.GET(
    new Request(`https://example.test/api/cart-recovery?token=${token}`)
  );
  assert.equal(get.status, 200);
  assert.equal(get.headers.get("set-cookie"), null);
  assert.equal(get.headers.get("Referrer-Policy"), "strict-origin");
  assert.equal(get.headers.get("Cache-Control"), "private, no-store");
  const html = await get.text();
  assert.ok(html.includes('lang="fr"'));
  assert.ok(!html.includes("<script"));
  const post = (origin: string) =>
    new Request("https://example.test/api/cart-recovery", {
      method: "POST",
      headers: { origin },
      body: new URLSearchParams({ token }),
    });
  const count = reads;
  assert.equal((await route.POST(post("https://attacker.test"))).status, 403);
  assert.equal(reads, count);
  const restored = await route.POST(post("https://example.test"));
  assert.equal(restored.status, 303);
  assert.equal(
    restored.headers.get("Location"),
    "https://example.test/fr/checkout"
  );
  assert.match(restored.headers.get("set-cookie")!, new RegExp(`cartId=${id}`));
  assert.match(restored.headers.get("set-cookie")!, /HttpOnly/);
  assert.match(restored.headers.get("set-cookie")!, /SameSite=lax/i);
  valid = false;
  const expired = await route.POST(post("https://example.test"));
  assert.equal(expired.status, 410);
  assert.equal(expired.headers.get("set-cookie"), null);
});

test("unsubscribe requires a deliberate same-origin POST; email scanners cannot unsubscribe", async () => {
  let writes = 0;
  const route = loadModule<
    typeof import("../src/app/api/cart-recovery/unsubscribe/route")
  >("src/app/api/cart-recovery/unsubscribe/route.ts", {
    "@/lib/db/queries/cart-recovery": {
      getUnsubscribeLink: async () => ({ locale: "fr" }),
      unsubscribeRecovery: async () => {
        writes++;
        return { locale: "fr" };
      },
    },
    "@/lib/cart-recovery/response": response,
  });
  assert.equal(
    (
      await route.GET(
        new Request(
          "https://example.test/api/cart-recovery/unsubscribe?token=test"
        )
      )
    ).status,
    200
  );
  assert.equal(writes, 0);
  for (const origin of ["https://other.test", "https://example.test"]) {
    const res = await route.POST(
      new Request("https://example.test/api/cart-recovery/unsubscribe", {
        method: "POST",
        headers: { origin },
        body: new URLSearchParams({ token: "test" }),
      })
    );
    assert.equal(res.status, origin.includes("other") ? 403 : 200);
  }
  assert.equal(writes, 1);
});
