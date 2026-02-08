import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { db } from "../src/lib/db/index";
import { orders, orderItems } from "../src/lib/db/schema";
import { desc } from "drizzle-orm";

async function verifyLatestOrder() {
  console.log("🔍 Checking latest order...\n");

  const [latestOrder] = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (!latestOrder) {
    console.log("❌ No orders found in database");
    return;
  }

  console.log(`✅ Latest Order Found:`);
  console.log(`   Order #${latestOrder.orderNumber}`);
  console.log(`   Customer: ${latestOrder.customerName} (${latestOrder.customerEmail})`);
  console.log(`   Status: ${latestOrder.status}`);
  console.log(`   Payment Status: ${latestOrder.paymentStatus}`);
  console.log(`   Total: $${(latestOrder.totalCents / 100).toFixed(2)} ${latestOrder.currency}`);
  console.log(`   Created: ${latestOrder.createdAt?.toISOString()}`);
  console.log(
    `   Stripe Session: ${latestOrder.stripeCheckoutSessionId || "N/A"}`
  );

  const items = await db
    .select()
    .from(orderItems)
    .where((t) => t.orderId === latestOrder.id);

  console.log(`\n   📦 Order Items (${items.length}):`);
  items.forEach((item, idx) => {
    console.log(`     ${idx + 1}. ${item.productTitle} - ${item.variantTitle}`);
    console.log(`        Quantity: ${item.quantity}`);
    console.log(`        Price: $${(item.priceCents / 100).toFixed(2)}`);
    if (item.attributes?.imageUrl) {
      console.log(`        Image: ${item.attributes.imageUrl}`);
    }
  });

  if (latestOrder.shippingAddress) {
    console.log(`\n   📍 Shipping Address:`);
    console.log(`      ${latestOrder.shippingAddress.line1}`);
    if (latestOrder.shippingAddress.line2) {
      console.log(`      ${latestOrder.shippingAddress.line2}`);
    }
    console.log(
      `      ${latestOrder.shippingAddress.city}, ${latestOrder.shippingAddress.state} ${latestOrder.shippingAddress.postalCode}`
    );
    console.log(`      ${latestOrder.shippingAddress.country}`);
  }

  if (latestOrder.trackingNumber) {
    console.log(`\n   🚚 Tracking: ${latestOrder.trackingNumber}`);
    if (latestOrder.trackingUrl) {
      console.log(`      URL: ${latestOrder.trackingUrl}`);
    }
  }

  console.log("\n✅ Order verified successfully!");
}

verifyLatestOrder()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Error:", err);
    process.exit(1);
  });
