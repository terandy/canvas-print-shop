import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { db } from "../src/lib/db/index";
import { orders, carts } from "../src/lib/db/schema";
import { desc } from "drizzle-orm";

async function debugCheckout() {
  console.log("🔍 Debugging Checkout Setup\n");

  // Check environment variables
  console.log("1️⃣ Environment Variables:");
  console.log(
    `   STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY?.substring(0, 20)}...`
  );
  console.log(
    `   STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 20)}...`
  );
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing"}`);
  console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || "❌ Missing"}`);
  console.log(`   ORDER_EMAIL: ${process.env.ORDER_EMAIL || "❌ Missing"}`);
  console.log(`   POSTGRES_URL: ${process.env.POSTGRES_URL ? "✅ Connected" : "❌ Missing"}`);

  // Check recent carts
  console.log("\n2️⃣ Recent Carts:");
  const recentCarts = await db
    .select()
    .from(carts)
    .orderBy(desc(carts.createdAt))
    .limit(5);

  if (recentCarts.length === 0) {
    console.log("   ⚠️  No carts found");
  } else {
    recentCarts.forEach((cart, idx) => {
      console.log(`   ${idx + 1}. Cart ${cart.id.substring(0, 8)}...`);
      console.log(`      Status: ${cart.status}`);
      console.log(`      Created: ${cart.createdAt?.toISOString()}`);
    });
  }

  // Check recent orders
  console.log("\n3️⃣ Recent Orders:");
  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(5);

  if (recentOrders.length === 0) {
    console.log("   ⚠️  No orders found");
  } else {
    recentOrders.forEach((order, idx) => {
      console.log(`   ${idx + 1}. Order #${order.orderNumber}`);
      console.log(`      Customer: ${order.customerEmail}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Created: ${order.createdAt?.toISOString()}`);
    });
  }

  // Check Stripe connection
  console.log("\n4️⃣ Testing Stripe Connection:");
  try {
    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);
    const balance = await stripeClient.balance.retrieve();
    console.log(`   ✅ Stripe connected successfully`);
    console.log(`   Available: $${(balance.available[0]?.amount || 0) / 100}`);
  } catch (error) {
    console.log(`   ❌ Stripe connection failed:`, error);
  }

  // Instructions
  console.log("\n5️⃣ Next Steps:");
  console.log("   1. Make sure Stripe CLI is running:");
  console.log("      stripe listen --forward-to localhost:3000/api/stripe/webhooks");
  console.log("   2. Start your dev server:");
  console.log("      npm run dev");
  console.log("   3. Test checkout with card: 4242 4242 4242 4242");
  console.log("   4. Watch the Stripe CLI terminal for webhook events");
  console.log("   5. Check this terminal for order creation");
}

debugCheckout()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Error:", err);
    process.exit(1);
  });
