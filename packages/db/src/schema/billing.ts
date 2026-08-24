import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { organization, user } from "./auth";

export type BillingProvider = "polar";

export type BillingPlan = "free" | "pro" | "max";

export type BillingInterval = "month" | "year";

export type BillingUsageStatus = "pending" | "sent" | "failed";

/**
 * Organization'ın billing identity'si.
 *
 * 1 Upkick Organization
 * =
 * 1 Polar Customer
 */
export const billingAccount = pgTable(
  "billing_account",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),

    provider: text("provider").$type<BillingProvider>().notNull().default("polar"),

    /**
     * Polar customer ID.
     *
     * Customer henüz Polar'da oluşturulmamışsa null olabilir.
     */
    providerCustomerId: text("provider_customer_id"),

    /**
     * Polar external_customer_id olarak
     * organization.id kullanacağız.
     *
     * Bu yüzden ayrıca externalCustomerId
     * kolonu tutmamıza gerek yok.
     */

    /**
     * Owner email olmak zorunda değil.
     *
     * Personal:
     * user@example.com
     *
     * Company:
     * billing@company.com
     */
    billingEmail: text("billing_email"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("billing_account_organization_id_unique").on(table.organizationId),

    uniqueIndex("billing_account_provider_customer_id_unique").on(table.providerCustomerId),
  ],
);

export const billingSubscription = pgTable(
  "billing_subscription",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),

    provider: text("provider").$type<BillingProvider>().notNull().default("polar"),

    providerSubscriptionId: text("provider_subscription_id").notNull(),

    providerProductId: text("provider_product_id").notNull(),

    plan: text("plan").$type<BillingPlan>().notNull(),

    billingInterval: text("billing_interval").$type<BillingInterval>(),

    /**
     * Polar'dan gelen status.
     *
     * İlk etapta string bırakıyorum.
     * Provider statuslarını domain enum'a
     * zorla sokmayalım.
     */
    status: text("status").notNull(),

    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),

    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }),

    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),

    canceledAt: timestamp("canceled_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("billing_subscription_organization_id_idx").on(table.organizationId),

    uniqueIndex("billing_subscription_provider_subscription_id_unique").on(
      table.providerSubscriptionId,
    ),
  ],
);

export const billingUsageEvent = pgTable(
  "billing_usage_event",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),

    /**
     * Krediyi kullanan gerçek kullanıcı.
     *
     * Kredi organization'dan düşer,
     * ama kimin kullandığını kaybetmeyiz.
     */
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    /**
     * Örn:
     * ai_usage
     */
    name: text("name").notNull(),

    /**
     * Kaç kredi tüketildi?
     *
     * Örn:
     * 3
     */
    units: integer("units").notNull(),

    /**
     * Örn:
     * chat_abc
     * document_xyz
     * agent_run_123
     */
    referenceId: text("reference_id"),

    status: text("status").$type<BillingUsageStatus>().notNull().default("pending"),

    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),

    attempts: integer("attempts").notNull().default(0),

    lastError: text("last_error"),

    sentAt: timestamp("sent_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("billing_usage_event_organization_id_idx").on(table.organizationId),

    index("billing_usage_event_user_id_idx").on(table.userId),

    index("billing_usage_event_reference_id_idx").on(table.referenceId),
  ],
);
