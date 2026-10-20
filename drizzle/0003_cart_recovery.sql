-- New tables only. Inline named constraints keep retries safe and match the
-- generated Drizzle snapshot without replaying existing schema migrations.
CREATE TABLE IF NOT EXISTS "cart_recovery_contacts" (
  "cart_id" uuid PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL,
  "locale" varchar(2) NOT NULL,
  "consented_at" timestamp DEFAULT now() NOT NULL,
  "last_attempt_at" timestamp,
  "last_sent_at" timestamp,
  CONSTRAINT "cart_recovery_contacts_cart_id_carts_id_fk"
    FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_recovery_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cart_id" uuid NOT NULL,
  "token_hash" varchar(64) NOT NULL,
  "unsubscribe_token_hash" varchar(64) NOT NULL,
  "email" varchar(255) NOT NULL,
  "locale" varchar(2) NOT NULL,
  "sent_by" uuid NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "sent_at" timestamp,
  "provider_id" varchar(255),
  CONSTRAINT "cart_recovery_links_token_hash_unique" UNIQUE("token_hash"),
  CONSTRAINT "cart_recovery_links_unsubscribe_token_hash_unique" UNIQUE("unsubscribe_token_hash"),
  CONSTRAINT "cart_recovery_links_cart_id_carts_id_fk"
    FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_recovery_suppressions" (
  "email" varchar(255) PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
