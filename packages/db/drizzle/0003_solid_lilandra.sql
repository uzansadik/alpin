DROP INDEX "apikey_reference_id_idx";--> statement-breakpoint
DROP INDEX "apikey_config_id_idx";--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "config_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "last_refill_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "enabled" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "rate_limit_enabled" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "request_count" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "last_request" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "expires_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "created_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX "apikey_referenceId_idx" ON "apikey" USING btree ("reference_id");--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_id_unique" UNIQUE("id");