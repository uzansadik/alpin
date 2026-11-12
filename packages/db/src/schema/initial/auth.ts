import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { boolean, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),

  /**
   * mqdms claim'leri. Organizasyon bir *referans* alanıdır; alpin kendi
   * organizasyon kaydını tutmaz.
   */
  organizationId: text("organization_id"),
  roles: text("roles").array(),
  permissions: text("permissions").array(),
  platformRole: text("platform_role").default("user"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("account_issuer_accountId_uidx").on(table.issuer, table.accountId),
    index("account_userId_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const apikey = pgTable(
  "apikey",
  {
    id: t.text("id").primaryKey().unique(),
    configId: t.text("config_id").notNull(),
    name: t.text("name"),
    start: t.text("start"),
    prefix: t.text("prefix"),
    key: t.text("key").notNull(),
    referenceId: t.text("reference_id").notNull(),
    refillInterval: t.integer("refill_interval"),
    refillAmount: t.integer("refill_amount"),
    lastRefillAt: t.timestamp("last_refill_at", { precision: 6, withTimezone: true }),
    enabled: t.boolean("enabled"),
    rateLimitEnabled: t.boolean("rate_limit_enabled"),
    rateLimitTimeWindow: t.integer("rate_limit_time_window"),
    rateLimitMax: t.integer("rate_limit_max"),
    requestCount: t.integer("request_count"),
    remaining: t.integer("remaining"),
    lastRequest: t.timestamp("last_request", { precision: 6, withTimezone: true }),
    expiresAt: t.timestamp("expires_at", { precision: 6, withTimezone: true }),
    createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
    updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }).notNull(),
    permissions: t.text("permissions"),
    metadata: t.text("metadata"),
  },
  (table) => [t.index("apikey_referenceId_idx").on(table.referenceId)],
);
