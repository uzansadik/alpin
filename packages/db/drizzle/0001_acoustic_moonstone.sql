CREATE TABLE "billing_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"provider" text DEFAULT 'polar' NOT NULL,
	"provider_customer_id" text,
	"billing_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"provider" text DEFAULT 'polar' NOT NULL,
	"provider_subscription_id" text NOT NULL,
	"provider_product_id" text NOT NULL,
	"plan" text NOT NULL,
	"billing_interval" text,
	"status" text NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_usage_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"units" integer NOT NULL,
	"reference_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billing_account" ADD CONSTRAINT "billing_account_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_subscription" ADD CONSTRAINT "billing_subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_usage_event" ADD CONSTRAINT "billing_usage_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_usage_event" ADD CONSTRAINT "billing_usage_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "billing_account_organization_id_unique" ON "billing_account" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_account_provider_customer_id_unique" ON "billing_account" USING btree ("provider_customer_id");--> statement-breakpoint
CREATE INDEX "billing_subscription_organization_id_idx" ON "billing_subscription" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_subscription_provider_subscription_id_unique" ON "billing_subscription" USING btree ("provider_subscription_id");--> statement-breakpoint
CREATE INDEX "billing_usage_event_organization_id_idx" ON "billing_usage_event" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "billing_usage_event_user_id_idx" ON "billing_usage_event" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "billing_usage_event_reference_id_idx" ON "billing_usage_event" USING btree ("reference_id");