ALTER TABLE "orders" ADD COLUMN "fulfilment_method" varchar(20);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "pickup_location" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "printed_at" timestamp;