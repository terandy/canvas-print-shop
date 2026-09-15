import assert from "node:assert/strict";
import test from "node:test";
import type { Stripe } from "@stripe/stripe-js";
import { mountCheckoutForm } from "../src/lib/stripe/checkout-form-client";

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));
function fixture() {
  const forms: {
    events: Record<string, (...args: any[]) => void>;
    mounts: number;
    destroys: number;
  }[] = [];
  let initializations = 0;
  let ready = 0;
  let errors = 0;
  let confirms = 0;
  let changes = 0;
  const stripe = {
    initCheckoutFormSdk() {
      initializations++;
      return {
        createForm() {
          const form = {
            events: {} as Record<string, (...args: any[]) => void>,
            mounts: 0,
            destroys: 0,
            on(name: string, handler: (...args: any[]) => void) {
              this.events[name] = handler;
            },
            mount() {
              this.mounts++;
            },
            destroy() {
              this.destroys++;
            },
          };
          forms.push(form);
          return form;
        },
        loadActions: async () => ({ type: "success", actions: {} }),
      };
    },
  } as unknown as Stripe;
  const options = {
    stripePromise: Promise.resolve(stripe),
    clientSecret: Promise.resolve("test-secret"),
    container: {} as HTMLElement,
    onReady() {
      ready++;
    },
    onError() {
      errors++;
    },
    onChange() {
      changes++;
    },
    onConfirm() {
      confirms++;
    },
  };
  return {
    options,
    forms,
    stats: () => ({ initializations, ready, errors, confirms, changes }),
  };
}

test("discarded StrictMode mounts do not create or destroy a Stripe form", async () => {
  const f = fixture();
  const discarded = mountCheckoutForm(f.options);
  discarded();
  const cleanup = mountCheckoutForm(f.options);
  await flush();
  assert.equal(f.stats().initializations, 1);
  assert.equal(f.forms[0].mounts, 1);
  assert.equal(f.forms[0].destroys, 0);
  f.forms[0].events.ready();
  assert.equal(f.stats().ready, 1);
  cleanup();
  assert.equal(f.forms[0].destroys, 1);
});

test("Stripe assets initialize while the server session is still pending", async () => {
  const f = fixture();
  const cleanup = mountCheckoutForm({
    ...f.options,
    clientSecret: new Promise(() => {}),
  });
  await flush();
  assert.equal(f.forms[0].mounts, 1);
  cleanup();
});

test("confirmation is gated on readiness and stale callbacks are ignored", async () => {
  const f = fixture();
  const cleanup = mountCheckoutForm(f.options);
  await flush();
  const events = f.forms[0].events;
  events.confirm({});
  assert.equal(f.stats().confirms, 0);
  events.ready();
  events.confirm({});
  events.change({});
  assert.equal(f.stats().confirms, 1);
  assert.equal(f.stats().changes, 1);
  cleanup();
  events.confirm({});
  events.change({});
  events.ready();
  events.loaderror({});
  assert.deepEqual(f.stats(), {
    initializations: 1,
    ready: 1,
    errors: 0,
    confirms: 1,
    changes: 1,
  });
});

test("navigation away and back creates a fresh usable form", async () => {
  const f = fixture();
  const first = mountCheckoutForm(f.options);
  await flush();
  first();
  const second = mountCheckoutForm(f.options);
  await flush();
  assert.equal(f.forms.length, 2);
  assert.equal(f.forms[0].destroys, 1);
  assert.equal(f.forms[1].destroys, 0);
  f.forms[1].events.ready();
  assert.equal(f.stats().ready, 1);
  second();
});

test("failed sessions fail closed without leaving a spinning form", async () => {
  const f = fixture();
  const cleanup = mountCheckoutForm({
    ...f.options,
    clientSecret: Promise.reject(new Error("failed")),
  });
  await flush();
  assert.equal(f.stats().errors, 1);
  assert.equal(f.stats().ready, 0);
  assert.equal(f.stats().initializations, 0);
  cleanup();
});

test("a stalled Stripe load times out instead of showing an endless placeholder", async () => {
  const f = fixture();
  const cleanup = mountCheckoutForm({ ...f.options, timeoutMs: 5 });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(f.stats().errors, 1);
  assert.equal(f.forms[0].destroys, 1);
  f.forms[0].events.ready();
  assert.equal(f.stats().ready, 0);
  cleanup();
});
