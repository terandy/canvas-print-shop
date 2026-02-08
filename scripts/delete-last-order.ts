import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { orders, orderItems } from "../src/lib/db/schema";
import { desc, eq } from "drizzle-orm";

async function deleteLastOrder() {
  // Find the last order
  const [lastOrder] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerEmail: orders.customerEmail,
      customerName: orders.customerName,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (!lastOrder) {
    console.log("No orders found.");
    process.exit(0);
  }

  console.log("\nLast order found:");
  console.log(`  Order #${lastOrder.orderNumber}`);
  console.log(`  Customer: ${lastOrder.customerName} (${lastOrder.customerEmail})`);
  console.log(`  Status: ${lastOrder.status}`);
  console.log(`  Total: $${((lastOrder.totalCents || 0) / 100).toFixed(2)}`);
  console.log(`  Created: ${lastOrder.createdAt}`);

  // Delete order items first (cascade should handle this, but being explicit)
  await db.delete(orderItems).where(eq(orderItems.orderId, lastOrder.id));
  // Delete the order
  await db.delete(orders).where(eq(orders.id, lastOrder.id));

  console.log(`\nOrder #${lastOrder.orderNumber} deleted successfully.`);
  process.exit(0);
}

deleteLastOrder().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
