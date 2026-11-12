import { appConfig } from "@alpin/config";
import { db } from "@alpin/db";
import * as schema from "@alpin/db/schema";
import { env } from "@alpin/env/server";
import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";

/**
 * mqdms claim adları. RFC 9068 gereği URI ile adlandırılır.
 *
 * Claim'ler mqdms tarafında `customAccessTokenClaims` ile access token
 * payload'ına, `customUserInfoClaims` ile userinfo yanıtına yazılır. **ID
 * token'da bulunmazlar.**
 */
const CLAIM_NAMESPACE = "https://auth.mqdms.com";
const ORGANIZATION_CLAIM = `${CLAIM_NAMESPACE}/organization`;
const ROLES_CLAIM = `${CLAIM_NAMESPACE}/roles`;
const PERMISSIONS_CLAIM = `${CLAIM_NAMESPACE}/permissions`;
const PLATFORM_ROLE_CLAIM = `${CLAIM_NAMESPACE}/platform-role`;

/** mqdms'in `platform-role` claim'inde yayınladığı değerler. */
const PLATFORM_ROLES = ["user", "superadmin"] as const;

/** mqdms userinfo yanıtı: OIDC standart claim'leri + RFC 9068 claim'leri. */
type MqdmsUserInfo = {
  sub?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
} & Record<string, unknown>;

/**
 * Claim alanları yalnızca mqdms callback'i üzerinden yazılabilir.
 *
 * `input: false` kullanılsaydı better-auth provider profilindeki claim'leri
 * de düşürürdü (`parseAdditionalUserInputFromProviderProfile`) ve claim'ler
 * hiçbir zaman user satırına yazılamazdı. Bu yüzden alanlar input'a açık
 * bırakılır; istemci kaynaklı yazmalar (ör. `POST /update-user`) veritabanı
 * hook'ları ile temizlenir.
 */
function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === "string");
}

function readPlatformRole(value: unknown): string {
  return PLATFORM_ROLES.includes(value as (typeof PLATFORM_ROLES)[number])
    ? (value as string)
    : "user";
}

/**
 * mqdms'in userinfo ucu.
 *
 * Claim'ler ID token'da olmadığı için better-auth'ın varsayılan userinfo
 * akışı (ID token'ı tercih eder) kullanılamaz; burada doğrudan userinfo
 * okunur. `openid` scope'u istendiği için yanıt `sub` ve standart profil
 * claim'lerini de içerir.
 */
async function fetchMqdmsUserInfo(accessToken: string): Promise<MqdmsUserInfo | null> {
  try {
    const response = await fetch(`${env.MQDMS_ISSUER}/api/auth/oauth2/userinfo`, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`mqdms userinfo isteği başarısız oldu (HTTP ${response.status}).`);
      return null;
    }

    return (await response.json()) as MqdmsUserInfo;
  } catch (error) {
    console.error("mqdms userinfo isteği başarısız oldu:", error);
    return null;
  }
}

/**
 * Callback dışındaki isteklerde claim alanlarını temizler. `undefined` değerler
 * drizzle tarafından yok sayıldığı için kolonlar üzerine yazılmaz.
 */
function stripClaimFields() {
  return {
    organizationId: undefined,
    roles: undefined,
    permissions: undefined,
    platformRole: undefined,
  };
}

/** Claim yazımına izin verilen tek akış mqdms OAuth callback'idir. */
function isMqdmsCallback(context: { path?: string } | null): boolean {
  return context?.path?.startsWith("/callback/") ?? false;
}

/**
 * CSRF koruması için güvenilir origin listesi.
 *
 * Better Auth `Origin` başlığını `trustedOrigins` ile karşılaştırır; liste
 * varsayılan olarak yalnızca `baseURL` (yani `BETTER_AUTH_URL`) origin'ini
 * içerir. Prod'da `BETTER_AUTH_URL` yanlış tanımlanırsa (örn. mqdms issuer'ı
 * yazılırsa) tarayıcı origin'i listede bulunamaz ve giriş akışı
 * `INVALID_ORIGIN` hatasıyla kırılır.
 *
 * Bu yüzden app'in public URL'i (`NEXT_PUBLIC_APP_URL`) de listeye eklenir.
 * Fonksiyon biçimi seçilir: Better Auth kendi origin'lerini (baseURL ve
 * `BETTER_AUTH_TRUSTED_ORIGINS` env'i) listeden düşürmez, üstüne ekler.
 */
function getTrustedOrigins(): string[] {
  const origins = new Set<string>();

  const add = (value: string | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed) return;

    try {
      origins.add(new URL(trimmed).origin);
    } catch {
      // Geçersiz origin yok sayılır.
    }
  };

  add(env.NEXT_PUBLIC_APP_URL);

  for (const value of env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []) {
    add(value);
  }

  return [...origins];
}

export const auth = betterAuth({
  appName: appConfig.name,

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  /**
   * Fonksiyon biçimi: Better Auth'in kendi origin'leri (baseURL ve
   * `BETTER_AUTH_TRUSTED_ORIGINS` env'i) listede kalır, üstüne app'in public
   * URL'i eklenir.
   */
  trustedOrigins: getTrustedOrigins,

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

  /**
   * mqdms tek kimlik sağlayıcısı olduğu için aynı e-posta ile gelen hesap
   * otomatik olarak eşleşir (bağlantı yine e-posta eşitliği şartına tabidir).
   */
  account: {
    accountLinking: {
      trustedProviders: ["mqdms"],
    },
  },

  user: {
    additionalFields: {
      organizationId: { type: "string", required: false },
      roles: { type: "string[]", required: false },
      permissions: { type: "string[]", required: false },
      platformRole: { type: "string", required: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          if (isMqdmsCallback(context)) return;

          return { data: { ...user, ...stripClaimFields() } };
        },
      },
      update: {
        before: async (user, context) => {
          if (isMqdmsCallback(context)) return;

          return { data: { ...user, ...stripClaimFields() } };
        },
      },
    },
  },

  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "mqdms",
          name: "MQDMS",
          clientId: env.MQDMS_CLIENT_ID,
          // Public client'ta secret yoktur.
          clientSecret: env.MQDMS_CLIENT_SECRET,
          /**
           * Token endpoint kimlik doğrulama yöntemi.
           *
           * Secret'li (confidential) mqdms client'ı `client_secret_basic`
           * olarak kayıtlıdır: secret HTTP Basic başlığında gönderilmelidir.
           * better-auth'in varsayılanı `client_secret_post`'tur (secret gövdeye
           * eklenir) ve mqdms bunu "client registered for client_secret_basic
           * cannot use client_secret_post" hatasıyla reddeder.
           *
           * Secret yoksa public client olur ve yöntem `none` olmalıdır
           * (secret ile `none` kombinasyonu better-auth tarafında reddedilir).
           */
          tokenEndpointAuth: env.MQDMS_CLIENT_SECRET
            ? { method: "client_secret_basic" }
            : { method: "none" },
          discoveryUrl: `${env.MQDMS_ISSUER}/.well-known/oauth-authorization-server`,
          scopes: ["openid", "profile", "email", "offline_access", "permissions:read"],
          pkce: true,
          redirectURI: env.MQDMS_REDIRECT_URI,
          // RFC 8707 `resource`: authorize ve token isteğinde aynı değer.
          authorizationUrlParams: { resource: env.MQDMS_RESOURCE },
          tokenUrlParams: { resource: env.MQDMS_RESOURCE },
          // Claim'ler her girişte tazelenir.
          overrideUserInfo: true,

          getUserInfo: async (tokens) => {
            const claims = await fetchMqdmsUserInfo(tokens.accessToken ?? "");
            if (!claims) return null;

            return {
              ...claims,
              // better-auth standart alanları camelCase bekliyor.
              email: claims.email ?? null,
              emailVerified: claims.email_verified === true,
              image: claims.picture ?? undefined,
              name: claims.name ?? undefined,
            };
          },

          mapProfileToUser: (profile) => ({
            organizationId: readString(profile[ORGANIZATION_CLAIM]),
            roles: readStringArray(profile[ROLES_CLAIM]),
            permissions: readStringArray(profile[PERMISSIONS_CLAIM]),
            platformRole: readPlatformRole(profile[PLATFORM_ROLE_CLAIM]),
          }),
        },
      ],
    }),
    apiKey([
      {
        configId: "user-keys",
        references: "user",
        defaultPrefix: "up_",
      },
    ]),
  ],
});
export type Session = typeof auth.$Infer.Session;
