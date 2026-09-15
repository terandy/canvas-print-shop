import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import * as jsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import * as business from "../src/lib/business-data";
import * as statuses from "../src/lib/orders/status";
import en from "../messages/en.json";
import fr from "../messages/fr.json";
import type { Order } from "../src/types/order";
import { loadModule } from "./helpers/load-module";

const orderFixture = (changes: Partial<Order> = {}): Order =>
  ({
    id: "order_test",
    orderNumber: 123,
    status: "printed",
    locale: "fr",
    fulfilmentMethod: "pickup",
    pickupLocation: "montreal",
    customerEmail: "buyer@example.test",
    customerName: "Test buyer",
    ...changes,
  }) as Order;

function emailModule(
  send: ((payload: any) => Promise<unknown>) | null,
  from: string | undefined = "shop@example.test"
) {
  return loadModule<typeof import("../src/lib/email/send")>(
    "src/lib/email/send.ts",
    {
      "./index": {
        resend: send ? { emails: { send } } : null,
        ORDER_EMAIL: from,
      },
      "@/lib/db/queries/admin-users": {},
      "@/lib/constants": {},
      "@/lib/business-data": business,
      "@/lib/orders/status": statuses,
      "../../../messages/en.json": en,
      "../../../messages/fr.json": fr,
    }
  );
}

test("pickup email rejects provider errors, absent confirmation and missing configuration", async () => {
  for (const result of [
    { data: null, error: { message: "rate limited" } },
    { data: null, error: null },
  ]) {
    await assert.rejects(
      emailModule(async () => result).sendPickupReady(orderFixture())
    );
  }
  await assert.rejects(
    emailModule(null).sendPickupReady(orderFixture()),
    /not configured/
  );
  await assert.rejects(
    emailModule(
      async () => ({ data: { id: "email_test" } }),
      ""
    ).sendPickupReady(orderFixture()),
    /not configured/
  );
  await assert.rejects(
    emailModule(async () => {
      throw new Error("timeout");
    }).sendPickupReady(orderFixture()),
    /timeout/
  );
});

test("pickup emails use the selected counter and customer language", async () => {
  for (const locale of ["en", "fr"] as const)
    for (const location of ["montreal", "quebec-city"]) {
      let payload: any;
      await emailModule(async (input) => {
        payload = input;
        return { data: { id: "email_test" }, error: null };
      }).sendPickupReady(orderFixture({ pickupLocation: location }), locale);
      const expected =
        location === "montreal"
          ? business.BUSINESS_DATA.locations.montrealBranch
          : business.BUSINESS_DATA.locations.quebecCityWorkshop;
      for (const line of business.getLocationAddressLines(expected, locale))
        assert.ok(payload.html.includes(line));
      assert.equal(
        payload.subject,
        (locale === "fr" ? fr : en).Email.pickupReady.subject.replace(
          "{orderNumber}",
          "123"
        )
      );
    }
});

function statusService(
  order: Order | undefined,
  sendPickupReady: (...args: any[]) => Promise<void>,
  failWrite = false
) {
  const writes: string[] = [];
  const service = loadModule<typeof import("../src/lib/orders/update-status")>(
    "src/lib/orders/update-status.ts",
    {
      "./status": statuses,
      "@/lib/db/queries/orders": {
        getOrder: async () => order,
        updateOrderStatus: async (_id: string, status: Order["status"]) => {
          if (failWrite) throw new Error("DB unavailable");
          writes.push(status);
          if (order) order.status = status;
        },
        addTrackingInfo: async () => {
          writes.push("shipped");
        },
      },
      "@/lib/email/send": {
        sendPickupReady,
        sendShippingUpdate: async () => {},
      },
    }
  );
  return { service, writes };
}

test("email rejection reports partial completion and can be retried without rewriting status", async () => {
  let rejected = true;
  let sends = 0;
  const email = emailModule(async () => {
    sends++;
    return rejected
      ? { data: null, error: { message: "rate limited" } }
      : { data: { id: "email_test" }, error: null };
  });
  const { service, writes } = statusService(
    orderFixture(),
    email.sendPickupReady
  );
  const input = { orderId: "order_test", status: "ready_for_pickup" };
  assert.deepEqual(await service.updateStatusWithNotification(input), {
    success: false,
    status: "ready_for_pickup",
    error: "pickupEmailFailed",
  });
  assert.deepEqual(writes, ["ready_for_pickup"]);
  // An ordinary duplicate update does not masquerade as a resend.
  await service.updateStatusWithNotification(input);
  assert.equal(sends, 1);
  rejected = false;
  assert.deepEqual(
    await service.updateStatusWithNotification({
      ...input,
      resendPickupEmail: true,
    }),
    { success: true, status: "ready_for_pickup", pickupEmailSent: true }
  );
  assert.equal(sends, 2);
  assert.deepEqual(writes, ["ready_for_pickup"]);
});

test("delivery orders, invalid locations and orders not ready for collection cannot send pickup emails", async () => {
  for (const order of [
    orderFixture({ fulfilmentMethod: "delivery", pickupLocation: null }),
    orderFixture({ pickupLocation: "unknown" }),
    orderFixture({ status: "fulfilled" }),
  ]) {
    let sends = 0;
    const { service, writes } = statusService(order, async () => {
      sends++;
    });
    const result = await service.updateStatusWithNotification({
      orderId: order.id,
      status: "ready_for_pickup",
      resendPickupEmail: true,
    });
    assert.equal(result.success, false);
    assert.equal(sends, 0);
    assert.equal(writes.length, 0);
  }
  await assert.rejects(
    emailModule(async () => {
      throw new Error("Should never call provider");
    }).sendPickupReady(orderFixture({ pickupLocation: null })),
    /valid pickup location/
  );
});

test("status write failure does not notify the customer", async () => {
  const { service } = statusService(
    orderFixture(),
    async () => {
      assert.fail("Email before successful status save");
    },
    true
  );
  assert.deepEqual(
    await service.updateStatusWithNotification({
      orderId: "order_test",
      status: "ready_for_pickup",
    }),
    { success: false, error: "updateFailed" }
  );
});

test("server action and API expose pickup-email failures and protect resend behind authentication", async () => {
  let signedIn = true;
  const { service } = statusService(orderFixture(), async () => {
    throw new Error("Provider rejected");
  });
  const invalidated: string[] = [];
  const session = {
    getAdminSession: async () => (signedIn ? { id: "admin_test" } : null),
  };
  const common = {
    "next/cache": { revalidatePath: (url: string) => invalidated.push(url) },
    "@/lib/orders/update-status": service,
  };
  const action = loadModule<typeof import("../src/lib/auth/actions")>(
    "src/lib/auth/actions.ts",
    {
      ...common,
      "next/navigation": {},
      "@/lib/db/queries/admin-users": {},
      "@/lib/db/queries/password-reset": {},
      "@/lib/email/send": {},
      "./index": {},
      "./session": session,
    }
  );
  const data = new FormData();
  data.set("orderId", "order_test");
  data.set("status", "ready_for_pickup");
  assert.equal(
    (await action.updateOrderStatusAction({}, data)).error,
    "pickupEmailFailed"
  );
  assert.ok(invalidated.includes("/en/admin/orders/order_test"));
  assert.ok(invalidated.includes("/fr/admin/orders/order_test"));
  const api = loadModule<
    typeof import("../src/app/api/admin/orders/[id]/status/route")
  >("src/app/api/admin/orders/[id]/status/route.ts", {
    ...common,
    "next/server": { NextResponse: Response },
    "@/lib/auth/session": session,
  });
  const request = () =>
    new Request("https://example.test/api/admin/orders/order_test/status", {
      method: "PATCH",
      body: JSON.stringify({
        status: "ready_for_pickup",
        intent: "resendPickupEmail",
      }),
    });
  const response = await api.PATCH(request() as any, {
    params: Promise.resolve({ id: "order_test" }),
  });
  assert.equal(response.status, 502);
  assert.equal((await response.json()).success, false);
  signedIn = false;
  assert.equal(
    (await action.updateOrderStatusAction({}, data)).error,
    "unauthorized"
  );
  assert.equal(
    (
      await api.PATCH(request() as any, {
        params: Promise.resolve({ id: "order_test" }),
      })
    ).status,
    401
  );
});

test("admin shows a translated failure and enabled resend both after failure and after reload", () => {
  for (const messages of [en, fr])
    for (const failed of [false, true]) {
      const t = (key: string) =>
        key
          .split(".")
          .reduce((value: any, part) => value[part], messages.Admin);
      const Form = loadModule<any>(
        "src/components/admin/order-status-form.tsx",
        {
          react: {
            ...React,
            useActionState: () => [
              failed
                ? { error: "pickupEmailFailed", status: "ready_for_pickup" }
                : {},
              undefined,
              false,
            ],
          },
          "react/jsx-runtime": jsx,
          "next-intl": { useTranslations: () => t },
          "@/lib/auth/actions": {},
          "@/lib/orders/status": statuses,
        }
      ).default;
      const html = renderToStaticMarkup(
        React.createElement(Form, {
          orderId: "order_test",
          currentStatus: "ready_for_pickup",
          canNotifyPickup: true,
        })
      );
      assert.ok(html.includes(messages.Admin.orders.resendPickupEmail));
      assert.match(
        html,
        /<button[^>]*name="intent"[^>]*value="resendPickupEmail"[^>]*>/
      );
      assert.doesNotMatch(
        html.match(/<button[^>]*name="intent"[^>]*>/)![0],
        /\sdisabled(?:=|\s|>)/
      );
      if (failed)
        assert.ok(
          html.includes(messages.Admin.orders.errors.pickupEmailFailed)
        );
      for (const value of Object.values(messages.Admin.orders.errors))
        assert.equal(typeof value, "string");
    }
});
