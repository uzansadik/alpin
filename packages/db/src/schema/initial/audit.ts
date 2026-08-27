import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { organization, user } from "./auth";

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),

    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),

    action: text("action").notNull(),

    targetType: text("target_type"),

    targetId: text("target_id"),

    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_log_organization_id_idx").on(table.organizationId),
    index("audit_log_actor_id_idx").on(table.actorId),
    index("audit_log_action_idx").on(table.action),
    index("audit_log_created_at_idx").on(table.createdAt),
  ],
);
