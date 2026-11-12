ALTER TABLE "user" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "roles" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "permissions" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "platform_role" text DEFAULT 'user';