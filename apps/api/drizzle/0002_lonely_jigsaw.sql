ALTER TABLE "orders" ADD COLUMN "payment_reference" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_reference_unique" UNIQUE("payment_reference");