import assert from "node:assert/strict";
import test from "node:test";
import * as business from "../src/lib/business-data";
import * as discount from "../src/lib/orders/discount";
import en from "../messages/en.json";
import fr from "../messages/fr.json";
import type { Order } from "../src/types/order";
import { loadModule } from "./helpers/load-module";

const order = {
  id: "order_test",
  orderNumber: 123,
  customerEmail: "buyer@example.test",
  customerName: "Test Buyer",
  subtotalCents: 4000,
  shippingCents: 1000,
  taxCents: 650,
  totalCents: 5650,
  currency: "CAD",
  shippingAddress: null,
  items: [
    {
      productTitle: "Rolled Canvas Print",
      variantTitle: "8x10 / with",
      quantity: 1,
      priceCents: 4000,
    },
  ],
} as unknown as Order;

function emailModule(
  admins: Array<{ email: string; name: string | null }>,
  send: (payload: any) => Promise<unknown>
) {
  return loadModule<typeof import("../src/lib/email/send")>(
    "src/lib/email/send.ts",
    {
      "./index": {
        resend: { emails: { send } },
        ORDER_EMAIL: "orders@example.test",
      },
      "@/lib/db/queries/admin-users": {
        getAdminUsersForOrderEmails: async () => admins,
      },
      "@/lib/constants": { BASE_URL: "https://canvasprintshop.ca" },
      "@/lib/orders/status": { canSendPickupReady: () => false },
      "@/lib/orders/discount": discount,
      "@/lib/business-data": business,
      "../../../messages/en.json": en,
      "../../../messages/fr.json": fr,
    }
  );
}

test("new-order alerts always include the company inbox", async () => {
  let payload: any;
  const email = emailModule(
    [{ email: "orders-team@example.test", name: "Orders" }],
    async (input) => {
      payload = input;
      return { data: { id: "email_test" }, error: null };
    }
  );

  await email.sendAdminOrderNotification(order);

  assert.deepEqual(
    new Set(payload.to),
    new Set(["orders-team@example.test", "info@canvasprintshop.ca"])
  );
  assert.equal(payload.to.length, 2);
});

test("new-order recipients are trimmed and deduplicated case-insensitively", () => {
  const email = emailModule([], async () => ({}));

  assert.deepEqual(
    email.getAdminOrderNotificationRecipients(
      [
        { email: " INFO@canvasprintshop.ca ", name: null },
        { email: "orders-team@example.test", name: null },
        { email: "ORDERS-TEAM@example.test", name: null },
      ],
      "fallback@example.test"
    ),
    ["info@canvasprintshop.ca", "ORDERS-TEAM@example.test"]
  );
});
