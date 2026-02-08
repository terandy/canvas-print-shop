import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { db } from "../src/lib/db/index";
import {
  orders,
  orderItems,
  products,
  productVariants,
} from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

// Order items data from Shopify CSV
const orderItemsData = [
  {
    orderNumber: 6, // Barbara Bilodeau
    lineItemName: "Canvas Prints - 16x24 / black / regular",
    quantity: 1,
    priceCents: 9200,
  },
  {
    orderNumber: 7, // Marie Haufman
    lineItemName: "Canvas Prints - 12x12 / none / regular",
    quantity: 1,
    priceCents: 5300,
  },
];

// Parse line item name to extract variant options
function parseLineItemName(name: string): {
  productTitle: string;
  size?: string;
  frame?: string;
  depth?: string;
} {
  const parts = name.split(" - ");
  const productTitle = parts[0]?.trim() || "Canvas Prints";

  if (parts[1]) {
    const options = parts[1].split(" / ").map((s) => s.trim());
    return {
      productTitle,
      size: options[0], // Changed from dimension to size
      frame: options[1],
      depth: options[2],
    };
  }

  return { productTitle };
}

async function findVariantByOptions(
  productHandle: string,
  size?: string,
  frame?: string,
  depth?: string
) {
  // First find the product
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.handle, productHandle));

  if (!product) {
    console.warn(`Product not found: ${productHandle}`);
    return null;
  }

  // Find matching variant
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id));

  console.log(`Found ${variants.length} variants for product ${productHandle}`);

  // Try to find exact match
  const match = variants.find((v) => {
    const opts = v.options as Record<string, string>;
    const sizeMatch = !size || opts.size === size; // Changed from dimension to size
    const frameMatch = !frame || opts.frame === frame;
    const depthMatch = !depth || opts.depth === depth;

    return sizeMatch && frameMatch && depthMatch;
  });

  if (match) {
    console.log(`  ✅ Found matching variant: ${match.title}`);
    return { variant: match, product };
  }

  console.warn(
    `  ❌ Variant not found for ${productHandle} with options:`,
    { size, frame, depth }
  );

  if (variants.length > 0) {
    console.log(`  Using first variant as fallback: ${variants[0].title}`);
    return { variant: variants[0], product };
  }

  return null;
}

async function addMissingOrderItems() {
  console.log("Adding missing order items to imported orders...\n");

  for (const data of orderItemsData) {
    console.log(`\n=== Processing Order #${data.orderNumber} ===`);

    // Find the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, data.orderNumber));

    if (!order) {
      console.error(`Order #${data.orderNumber} not found`);
      continue;
    }

    // Check if order already has items
    const existingItems = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    if (existingItems.length > 0) {
      console.log(`Order #${data.orderNumber} already has ${existingItems.length} item(s)`);
      continue;
    }

    // Parse line item
    const lineItem = parseLineItemName(data.lineItemName);
    console.log(`Line item:`, lineItem);

    // Find matching variant
    const variantMatch = await findVariantByOptions(
      "canvas",
      lineItem.size,
      lineItem.frame,
      lineItem.depth
    );

    if (!variantMatch) {
      console.error(`Could not find product/variant for line item`);
      continue;
    }

    const { variant, product } = variantMatch;

    // Create order item
    await db.insert(orderItems).values({
      orderId: order.id,
      variantId: variant.id,
      productHandle: product.handle,
      productTitle: product.titleEn,
      variantTitle: variant.title,
      quantity: data.quantity,
      priceCents: data.priceCents,
      selectedOptions: variant.options,
      attributes: {},
    });

    console.log(
      `✅ Created order item: ${product.titleEn} - ${variant.title} x${data.quantity}`
    );
  }

  console.log(`\n=== Complete ===`);
}

// Run the script
addMissingOrderItems()
  .then(() => {
    console.log("\n✅ All order items added successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });
