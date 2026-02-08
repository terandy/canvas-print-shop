import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { db } from "../src/lib/db/index";
import {
  customers,
  orders,
  orderItems,
  products,
  productVariants,
} from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

interface ShopifyOrderRow {
  Name: string;
  Email: string;
  "Financial Status": string;
  "Paid at": string;
  "Fulfillment Status": string;
  "Fulfilled at": string;
  Currency: string;
  Subtotal: string;
  Shipping: string;
  Taxes: string;
  Total: string;
  "Shipping Method": string;
  "Created at": string;
  "Lineitem quantity": string;
  "Lineitem name": string;
  "Lineitem price": string;
  "Billing Name": string;
  "Billing Street": string;
  "Billing Address1": string;
  "Billing Address2": string;
  "Billing City": string;
  "Billing Zip": string;
  "Billing Province": string;
  "Billing Country": string;
  "Billing Phone": string;
  "Shipping Name": string;
  "Shipping Street": string;
  "Shipping Address1": string;
  "Shipping Address2": string;
  "Shipping City": string;
  "Shipping Zip": string;
  "Shipping Province": string;
  "Shipping Country": string;
  "Shipping Phone": string;
  Notes: string;
  Id: string;
}

// Parse line item name to extract variant options
// Format: "Canvas Prints - 16x24 / black / regular"
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
      size: options[0],
      frame: options[1],
      depth: options[2],
    };
  }

  return { productTitle };
}

// Convert dollar amount to cents
function dollarsToCents(dollars: string): number {
  return Math.round(parseFloat(dollars) * 100);
}

async function findOrCreateCustomer(email: string, name?: string) {
  // Check if customer exists
  const [existingCustomer] = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email));

  if (existingCustomer) {
    return existingCustomer.id;
  }

  // Create new customer
  const nameParts = name?.split(" ") || [];
  const [newCustomer] = await db
    .insert(customers)
    .values({
      email,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" ") || undefined,
    })
    .returning({ id: customers.id });

  return newCustomer.id;
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

  // Try to find exact match
  const match = variants.find((v) => {
    const opts = v.options as Record<string, string>;
    return (
      (!size || opts.size === size) &&
      (!frame || opts.frame === frame) &&
      (!depth || opts.depth === depth)
    );
  });

  if (match) {
    return { variant: match, product };
  }

  console.warn(
    `Variant not found for ${productHandle} with options:`,
    { size, frame, depth }
  );
  return { variant: variants[0], product }; // Return first variant as fallback
}

async function importOrders() {
  const csvPath = "./src/orders_export (2).csv";
  const fileContent = readFileSync(csvPath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ShopifyOrderRow[];

  console.log(`Found ${records.length} orders to import\n`);

  for (const row of records) {
    const orderName = row.Name;
    console.log(`\n=== Importing ${orderName} ===`);
    console.log(`Customer: ${row["Billing Name"]} (${row.Email})`);

    // Find or create customer
    const customerId = await findOrCreateCustomer(
      row.Email,
      row["Billing Name"]
    );
    console.log(`Customer ID: ${customerId}`);

    // Parse dates
    const createdAt = new Date(row["Created at"]);
    const paidAt = row["Paid at"] ? new Date(row["Paid at"]) : null;
    const fulfilledAt = row["Fulfilled at"]
      ? new Date(row["Fulfilled at"])
      : null;

    // Parse amounts
    const subtotalCents = dollarsToCents(row.Subtotal);
    const shippingCents = dollarsToCents(row.Shipping);
    const taxCents = dollarsToCents(row.Taxes);
    const totalCents = dollarsToCents(row.Total);

    // Build addresses
    const shippingAddress = {
      line1: row["Shipping Address1"],
      line2: row["Shipping Address2"] || undefined,
      city: row["Shipping City"],
      state: row["Shipping Province"],
      postalCode: row["Shipping Zip"],
      country: row["Shipping Country"],
    };

    const billingAddress = {
      line1: row["Billing Address1"],
      line2: row["Billing Address2"] || undefined,
      city: row["Billing City"],
      state: row["Billing Province"],
      postalCode: row["Billing Zip"],
      country: row["Billing Country"],
    };

    // Determine status
    const fulfillmentStatus = row["Fulfillment Status"].toLowerCase();
    const orderStatus =
      fulfillmentStatus === "fulfilled"
        ? "fulfilled"
        : fulfillmentStatus === "partial"
          ? "processing"
          : "paid";

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        customerId,
        status: orderStatus,
        paymentStatus: "paid",
        subtotalCents,
        taxCents,
        shippingCents,
        totalCents,
        currency: row.Currency,
        shippingAddress,
        billingAddress,
        customerEmail: row.Email,
        customerName: row["Billing Name"],
        customerPhone: row["Billing Phone"] || row["Shipping Phone"] || undefined,
        paidAt,
        shippedAt: fulfilledAt,
        fulfilledAt: fulfillmentStatus === "fulfilled" ? fulfilledAt : null,
        createdAt,
        updatedAt: fulfilledAt || createdAt,
      })
      .returning();

    console.log(`Created order #${order.orderNumber} (ID: ${order.id})`);

    // Parse line item
    const lineItem = parseLineItemName(row["Lineitem name"]);
    console.log(`Line item:`, lineItem);

    // Find matching variant
    const variantMatch = await findVariantByOptions(
      "canvas", // Product handle
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
      quantity: parseInt(row["Lineitem quantity"]),
      priceCents: dollarsToCents(row["Lineitem price"]),
      selectedOptions: variant.options,
      attributes: {}, // No custom attributes from Shopify export
    });

    console.log(
      `Created order item: ${product.titleEn} - ${variant.title} x${row["Lineitem quantity"]}`
    );
    console.log(`✅ Order ${orderName} imported successfully`);
  }

  console.log(`\n=== Import Complete ===`);
}

// Run the import
importOrders()
  .then(() => {
    console.log("\n✅ All orders imported successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Import failed:", error);
    process.exit(1);
  });
