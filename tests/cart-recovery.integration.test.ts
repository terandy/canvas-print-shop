import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { Client, Pool } from "pg";
import * as orm from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/lib/db/schema";
import * as shared from "../src/lib/cart-recovery/shared";
import { loadModule } from "./helpers/load-module";

const url = process.env.CPS_TEST_DATABASE_URL;

test(
  "recovery migration, consent, atomic send claims, token expiry, paid carts and email-wide opt-out",
  { skip: !url },
  async () => {
    const parsed = new URL(url!);
    assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname));
    assert.equal(parsed.pathname, "/cps_regression");
    const client = new Client({ connectionString: url });
    const testSchema = `recovery_test_${randomUUID().replaceAll("-", "")}`;
    await client.connect();
    let pool: Pool | undefined;
    try {
      await client.query(`CREATE SCHEMA "${testSchema}"`);
      await client.query(`SET search_path TO "${testSchema}"`);
      await client.query(
        readFileSync(
          "drizzle/0000_eminent_major_mapleleaf.sql",
          "utf8"
        ).replaceAll('"public".', `"${testSchema}".`)
      );
      const migration = readFileSync("drizzle/0003_cart_recovery.sql", "utf8");
      await client.query(migration);
      await client.query(migration); // Safe to rerun after interrupted rollout.
      pool = new Pool({
        connectionString: url,
        max: 4,
        options: `-c search_path=${testSchema}`,
      });
      const db = drizzle(pool, { schema });
      const queries = loadModule<
        typeof import("../src/lib/db/queries/cart-recovery")
      >("src/lib/db/queries/cart-recovery.ts", {
        "drizzle-orm": orm,
        "../index": { db },
        "../schema": schema,
        "@/lib/cart-recovery/shared": shared,
      });
      const [product] = await db
        .insert(schema.products)
        .values({ handle: "test-canvas", titleEn: "Canvas", titleFr: "Toile" })
        .returning();
      const [variant] = await db
        .insert(schema.productVariants)
        .values({
          productId: product.id,
          title: "16×24",
          priceCents: 12500,
          options: { dimension: "16x24", frame: "none", depth: "gallery" },
        })
        .returning();
      const [cart] = await db
        .insert(schema.carts)
        .values({
          updatedAt: new Date(Date.now() - 2 * shared.RECOVERY_IDLE_MS),
          expiresAt: new Date(Date.now() + 30 * 86400000),
        })
        .returning();
      const artwork = {
        imageUrl: "https://example.test/artwork.jpg",
        borderStyle: "wrapped",
        orientation: "portrait" as const,
      };
      await db.insert(schema.cartItems).values({
        cartId: cart.id,
        variantId: variant.id,
        quantity: 2,
        attributes: artwork,
      });
      assert.equal(
        shared.recoveryBlock((await queries.getRecoveryCart(cart.id))!),
        "noEmail"
      );
      assert.equal(
        await queries.saveRecoveryContact(cart.id, "buyer@example.test", "fr"),
        true
      );
      assert.equal(
        shared.recoveryBlock((await queries.getRecoveryCart(cart.id))!),
        "recentActivity"
      );
      await db
        .update(schema.carts)
        .set({ updatedAt: new Date(Date.now() - 2 * shared.RECOVERY_IDLE_MS) })
        .where(orm.eq(schema.carts.id, cart.id));
      const saved = (await queries.getRecoveryCart(cart.id))!;
      assert.equal(saved.contact?.locale, "fr");
      assert.equal(saved.hasOrder, false);
      assert.deepEqual(saved.items[0].attributes, artwork);
      assert.equal(saved.items[0].quantity, 2);
      assert.equal(saved.items[0].priceCents, 12500);
      assert.equal(shared.recoveryBlock(saved), null);

      const recovery = shared.createRecoveryToken();
      const unsubscribe = shared.createRecoveryToken();
      const adminId = randomUUID();
      const claims = await Promise.all([
        queries.claimRecoverySend(
          saved,
          adminId,
          recovery.tokenHash,
          unsubscribe.tokenHash
        ),
        queries.claimRecoverySend(
          saved,
          adminId,
          recovery.tokenHash,
          unsubscribe.tokenHash
        ),
      ]);
      assert.equal(
        claims.filter(Boolean).length,
        1,
        "concurrent admin clicks produce only one send claim"
      );
      const link = claims.find(Boolean)!;
      assert.equal(
        shared.recoveryBlock((await queries.getRecoveryCart(cart.id))!),
        "recentAttempt"
      );
      await queries.recordRecoverySent(link.id, "synthetic-email-id");
      assert.ok((await queries.getRecoveryCart(cart.id))!.contact!.lastSentAt);
      assert.equal(
        (await queries.getRecoveryLink(recovery.token))?.cart.id,
        cart.id
      );
      assert.equal(
        await queries.getRecoveryLink(shared.createRecoveryToken().token),
        null
      );
      assert.equal(await queries.getRecoveryLink(unsubscribe.token), null);
      assert.equal(await queries.getUnsubscribeLink(recovery.token), null);
      assert.equal(
        (await queries.getUnsubscribeLink(unsubscribe.token))?.email,
        "buyer@example.test"
      );

      // Another recipient must never inherit an earlier recipient's bearer link.
      await db
        .update(schema.cartRecoveryContacts)
        .set({ email: "other@example.test" })
        .where(orm.eq(schema.cartRecoveryContacts.cartId, cart.id));
      assert.equal(await queries.getRecoveryLink(recovery.token), null);
      await db
        .update(schema.cartRecoveryContacts)
        .set({ email: "buyer@example.test" })
        .where(orm.eq(schema.cartRecoveryContacts.cartId, cart.id));
      await db
        .update(schema.cartRecoveryLinks)
        .set({ expiresAt: new Date(0) })
        .where(orm.eq(schema.cartRecoveryLinks.id, link.id));
      assert.equal(await queries.getRecoveryLink(recovery.token), null);
      assert.ok(
        await queries.getUnsubscribeLink(unsubscribe.token),
        "unsubscribe remains valid after recovery expiry"
      );
      await db
        .update(schema.cartRecoveryLinks)
        .set({ expiresAt: new Date(Date.now() + shared.RECOVERY_LINK_MS) })
        .where(orm.eq(schema.cartRecoveryLinks.id, link.id));
      await db
        .update(schema.carts)
        .set({ status: "converted" })
        .where(orm.eq(schema.carts.id, cart.id));
      assert.equal(await queries.getRecoveryLink(recovery.token), null);
      await db
        .update(schema.carts)
        .set({ status: "active" })
        .where(orm.eq(schema.carts.id, cart.id));

      // An order row protects even a cart whose status update has lagged.
      const order = await client.query(
        "INSERT INTO orders (cart_id, customer_email, subtotal_cents, total_cents, payment_status) VALUES ($1,'buyer@example.test',25000,25000,'paid') RETURNING id",
        [cart.id]
      );
      assert.equal((await queries.getRecoveryCart(cart.id))!.hasOrder, true);
      assert.equal(await queries.getRecoveryLink(recovery.token), null);
      await client.query("DELETE FROM orders WHERE id=$1", [order.rows[0].id]);

      const [second] = await db
        .insert(schema.carts)
        .values({ updatedAt: saved.updatedAt })
        .returning();
      await db.insert(schema.cartItems).values({
        cartId: second.id,
        variantId: variant.id,
        attributes: artwork,
      });
      await queries.saveRecoveryContact(second.id, "buyer@example.test", "en");
      await db
        .update(schema.carts)
        .set({ updatedAt: saved.updatedAt })
        .where(orm.eq(schema.carts.id, second.id));
      const beforeSuppression = (await queries.getRecoveryCart(second.id))!;
      await queries.unsubscribeRecovery(unsubscribe.token);
      assert.equal(await queries.getRecoveryLink(recovery.token), null);
      assert.equal(
        shared.recoveryBlock((await queries.getRecoveryCart(second.id))!),
        "unsubscribed"
      );
      assert.equal(
        await queries.claimRecoverySend(
          beforeSuppression,
          adminId,
          shared.createRecoveryToken().tokenHash,
          shared.createRecoveryToken().tokenHash
        ),
        null,
        "a stale preview cannot bypass a new unsubscribe"
      );
      assert.deepEqual(
        (await queries.getRecoveryCart(cart.id))!.items[0].attributes,
        artwork
      );
    } finally {
      await pool?.end();
      await client.query(`DROP SCHEMA "${testSchema}" CASCADE`);
      await client.end();
    }
  }
);
