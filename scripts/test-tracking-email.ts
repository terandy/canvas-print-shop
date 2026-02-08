import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { db } from "../src/lib/db/index";
import { orders } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendShippingUpdate } from "../src/lib/email/send";
import { getOrder } from "../src/lib/db/queries/orders";

async function testTrackingEmail() {
  const orderNumber = parseInt(process.argv[2]);

  if (!orderNumber) {
    console.error("❌ Usage: npm run test:tracking <order_number>");
    console.error("   Example: npm run test:tracking 6");
    process.exit(1);
  }

  console.log(`🔍 Looking for order #${orderNumber}...\n`);

  const [orderRow] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber));

  if (!orderRow) {
    console.error(`❌ Order #${orderNumber} not found`);
    process.exit(1);
  }

  const order = await getOrder(orderRow.id);

  if (!order) {
    console.error(`❌ Could not load order #${orderNumber}`);
    process.exit(1);
  }

  console.log(`✅ Found order #${orderNumber}`);
  console.log(`   Customer: ${order.customerName} (${order.customerEmail})`);

  // Use existing tracking or create test tracking
  const trackingNumber = order.trackingNumber || "TEST-TRACKING-123456789";
  const trackingUrl =
    order.trackingUrl ||
    `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${trackingNumber}`;

  console.log(`\n📧 Sending tracking email...`);
  console.log(`   Tracking: ${trackingNumber}`);
  console.log(`   URL: ${trackingUrl}`);

  try {
    await sendShippingUpdate(order, trackingNumber, trackingUrl, "en");
    console.log(`\n✅ Tracking email sent successfully!`);
    console.log(`   Check ${order.customerEmail} for the email`);
    console.log(`   Also check: https://resend.com/emails`);
  } catch (error) {
    console.error(`\n❌ Failed to send tracking email:`, error);
    process.exit(1);
  }
}

testTrackingEmail()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Error:", err);
    process.exit(1);
  });
