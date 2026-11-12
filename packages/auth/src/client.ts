import { env } from "@alpin/env/client";
import { apiKeyClient } from "@better-auth/api-key/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [apiKeyClient()],
});

export const { signIn, signOut, useSession } = authClient;

/**
 * mqdms'e yönlendirerek giriş akışını başlatır. mqdms'te giriş, organizasyon
 * seçimi ve onay adımları tamamlanınca `callbackURL`'e dönülür.
 */
export function signInWithMqdms(callbackURL: string) {
  return authClient.signIn.social({ provider: "mqdms", callbackURL });
}

export type Session = typeof authClient.$Infer.Session;
