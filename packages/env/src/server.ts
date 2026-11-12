import { z } from "zod";

// `.env` dosyasında değişken tanımlı ama boş bırakılmış olabilir
// (`STORAGE_ENDPOINT=`). `optional()` yalnızca "anahtar hiç yok" durumunu
// kabul eder; boş string URL doğrulamasını geçmez. Boş string'leri
// `undefined`'a çeviriyoruz.
const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.url().optional());

// Public client (secret yok) ve boş bırakılabilen metin değişkenleri için.
const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const serverEnvSchema = z.object({
  APP_ENV: z.enum(["local", "production", "test"]).default("local"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .meta({ description: "The database connection URL" }),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  // CSRF koruması için ek güvenilir origin'ler (virgülle ayrılmış).
  // Better Auth `BETTER_AUTH_TRUSTED_ORIGINS` env'ini kendi okur; burada
  // tanımlanması, origin listesinin app'in public URL'ini de içermesini
  // garanti eder.
  BETTER_AUTH_TRUSTED_ORIGINS: optionalString,
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.email().min(1, "RESEND_FROM_EMAIL is required"),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_REGION: z.string().min(1),
  STORAGE_ENDPOINT: optionalUrl,
  STORAGE_ACCESS_KEY_ID: z.string().min(1),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1),
  STORAGE_PUBLIC_URL: optionalUrl,
  NEXT_PUBLIC_APP_URL: z.url().min(1, "NEXT_PUBLIC_APP_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // mqdms (merkezi OAuth 2.1 / OIDC sağlayıcısı) bağlantısı.
  MQDMS_ISSUER: z.url().default("https://auth.mqdms.com"),
  MQDMS_CLIENT_ID: z.string().min(1, "MQDMS_CLIENT_ID is required"),
  // Public client'ta boş bırakılır.
  MQDMS_CLIENT_SECRET: optionalString,
  // Varsayılan: `${NEXT_PUBLIC_APP_URL}/api/auth/callback/mqdms`
  MQDMS_REDIRECT_URI: optionalUrl,
  // Varsayılan: `${NEXT_PUBLIC_APP_URL}` (RFC 8707 `resource` değeri)
  MQDMS_RESOURCE: optionalUrl,
});

const parsedEnv = serverEnvSchema.parse({
  APP_ENV: process.env.APP_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  STORAGE_BUCKET: process.env.STORAGE_BUCKET,
  STORAGE_REGION: process.env.STORAGE_REGION,
  STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
  STORAGE_ACCESS_KEY_ID: process.env.STORAGE_ACCESS_KEY_ID,
  STORAGE_SECRET_ACCESS_KEY: process.env.STORAGE_SECRET_ACCESS_KEY,
  STORAGE_PUBLIC_URL: process.env.STORAGE_PUBLIC_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  REDIS_URL: process.env.REDIS_URL,
  MQDMS_ISSUER: process.env.MQDMS_ISSUER,
  MQDMS_CLIENT_ID: process.env.MQDMS_CLIENT_ID,
  MQDMS_CLIENT_SECRET: process.env.MQDMS_CLIENT_SECRET,
  MQDMS_REDIRECT_URI: process.env.MQDMS_REDIRECT_URI,
  MQDMS_RESOURCE: process.env.MQDMS_RESOURCE,
});

export const env = {
  ...parsedEnv,

  MQDMS_REDIRECT_URI:
    parsedEnv.MQDMS_REDIRECT_URI ?? `${parsedEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback/mqdms`,

  MQDMS_RESOURCE: parsedEnv.MQDMS_RESOURCE ?? parsedEnv.NEXT_PUBLIC_APP_URL,
};

export type ServerEnv = typeof env;
