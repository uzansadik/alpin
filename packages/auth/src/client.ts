import { polarClient } from "@polar-sh/better-auth/client";
import { env } from "@upkick/env/client";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [adminClient(), organizationClient(), polarClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
