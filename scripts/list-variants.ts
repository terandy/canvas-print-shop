import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { db } from "../src/lib/db/index";
import { productVariants, products } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function listVariants() {
  const variants = await db
    .select({
      id: productVariants.id,
      title: productVariants.title,
      priceCents: productVariants.priceCents,
      options: productVariants.options,
      productId: productVariants.productId,
    })
    .from(productVariants);

  const allProducts = await db.select().from(products);

  console.log(`Found ${variants.length} variants across ${allProducts.length} products:\n`);

  for (const product of allProducts) {
    console.log(`=== ${product.titleEn} (${product.handle}) ===`);
    const productVariantsList = variants.filter((v) => v.productId === product.id);
    for (const v of productVariantsList) {
      console.log(
        `  ${v.title} | $${(v.priceCents / 100).toFixed(2)} | options: ${JSON.stringify(v.options)}`
      );
    }
    console.log();
  }
}

listVariants()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
