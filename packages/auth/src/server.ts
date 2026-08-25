import { checkout, polar, portal, usage, webhooks } from "@polar-sh/better-auth";
import { appConfig } from "@upkick/config";
import { db } from "@upkick/db";
import * as schema from "@upkick/db/schema";
import {
  sendOrganizationInvitationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@upkick/email";
import { env } from "@upkick/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import { polarClient } from "./polar";

export const auth = betterAuth({
  appName: appConfig.name,

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  session: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 1 * 60, // 5 minutes
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail({
        email: user.email,
        url,
      }).catch(console.error);
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),

    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail({
        email: user.email,
        url,
      }).catch(console.error);
    },
  },

  plugins: [
    admin(),

    organization({
      requireEmailVerificationOnInvitation: true,

      async sendInvitationEmail(data) {
        const url = new URL("/accept-invitation", env.BETTER_AUTH_URL);

        url.searchParams.set("id", data.id);

        await sendOrganizationInvitationEmail({
          email: data.email,
          inviterName: data.inviter.user.name,
          organizationName: data.organization.name,
          url: url.toString(),
        });
      },
    }),
    polar({
      client: polarClient,

      createCustomerOnSignUp: true,

      use: [
        checkout({
          products: [
            {
              productId: env.POLAR_PRO_MONTHLY_PRODUCT_ID,
              slug: "pro-monthly",
            },

            ...(env.POLAR_PRO_YEARLY_PRODUCT_ID
              ? [
                  {
                    productId: env.POLAR_PRO_YEARLY_PRODUCT_ID,
                    slug: "pro-yearly",
                  },
                ]
              : []),

            {
              productId: env.POLAR_AI_CREDITS_500_PRODUCT_ID,
              slug: "ai-credits-500",
            },
          ],

          successUrl: "/settings/billing?checkout=success&checkout_id={CHECKOUT_ID}",

          authenticatedUsersOnly: true,
        }),

        portal(),

        usage(),

        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,

          onPayload: async (payload) => {
            console.log("[polar webhook]", payload.type);
          },
        }),
      ],
    }),
  ],
});
export type Session = typeof auth.$Infer.Session;
