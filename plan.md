# Alpin → mqdms (OAuth/OIDC) dönüşüm planı

> Durum: **uygulama tamamlandı** (branch: `feat/mqdms-oauth`). Bu dosya, alpin
> deposunda kimlik doğrulamasını mqdms'e (merkezi OAuth 2.1 / OIDC sağlayıcısı)
> taşıyan işi tarif eder. Bilinen teknik doğrular
> `docs/mqdms-auth-reference.md` dosyasında toplanmıştır.
> Uygulama sırasında düzeltilen noktalar için §6'ya bakın.

## 0. Bağlam

- **mqdms** (`github.com/uzansadik/mqdms`, issuer: `https://auth.mqdms.com`) =
  Better Auth 1.7.20 + `@better-auth/oauth-provider` 1.7.20. Kullanıcı,
  organizasyon, üyelik, rol ve izin yönetiminin **tamamı** mqdms'te.
- **alpin** (`github.com/uzansadik/alpin`) = QMS uygulaması. Bugün kendi
  Better Auth kurulumunu kullanıyor: e-posta/şifre, `admin` plugin'i,
  `organization` plugin'i, kendi `organization`/`member`/`invitation`
  tabloları.
- **Karar (kullanıcı):** Alpin yalnızca mqdms'e bağlanır. Alpin
  organizasyon modeli **taşımaz**; tüm organizasyon ve kullanıcı ayarları
  `auth.mqdms.com` üzerinden yönetilir.
- **Karar:** Mevcut **"Alpin Web"** OAuth client'ı kullanılacak.

## 1. Doğrulanmış teknik zemin

### mqdms tarafı (canlı kontrat)

| Konu | Değer |
| --- | --- |
| Issuer | `https://auth.mqdms.com` |
| Discovery | `GET /.well-known/oauth-authorization-server` ve `GET /.well-known/openid-configuration` |
| Authorize | `GET /api/auth/oauth2/authorize` |
| Token | `POST /api/auth/oauth2/token` |
| UserInfo | `GET /api/auth/oauth2/userinfo` (`Authorization: Bearer <access_token>`) |
| JWKS | `GET /api/auth/jwks` |
| Introspect / Revoke | `POST /api/auth/oauth2/introspect` · `POST /api/auth/oauth2/revoke` |
| End session | `GET /api/auth/oauth2/end-session` |
| Scope'lar | `openid profile email offline_access permissions:read` |
| PKCE | Zorunlu, `S256` |

Yayınlanan claim'ler (RFC 9068 URI adlandırması, namespace
`https://auth.mqdms.com`):

| Claim | İçerik | Not |
| --- | --- | --- |
| `https://auth.mqdms.com/organization` | organizasyon **id**'si | onay (`consentReferenceId`) ile belirlenir |
| `https://auth.mqdms.com/roles` | `string[]` | yalnızca `permissions:read` scope'u ile |
| `https://auth.mqdms.com/permissions` | `string[]` | yalnızca `permissions:read` scope'u ile |
| `https://auth.mqdms.com/platform-role` | `user` \| `superadmin` | her zaman |

Claim'ler hem access token JWT payload'ında hem de **userinfo yanıtında**
(`customUserInfoClaims`) bulunur. Önemli: claim'lerde organizasyon **adı
yoktur**, yalnızca id vardır.

RFC 8707 `resource` parametresi authorize ve token isteklerinde desteklenir.
`resource` kayıtlı bir `oauth_resource` olmalı ve client'a bağlı
(`oauth_client_resource`) olmalıdır; bu durumda access token, `aud` = resource
olan bir JWT olur.

Client kaydı yalnızca platform superadmin'ine açıktır
(`auth.mqdms.com/admin/oauth-clients`). Secret **yalnızca bir kez** gösterilir.
`token_endpoint_auth_method: none` → **public client** (secret yok, PKCE zorunlu).

### "Alpin Web" client'ı (yerel mqdms veritabanı)

```
client_id                 dSkqGeVJENeqZktGLRyoyioEqbrmQCDo
client_secret             NULL
token_endpoint_auth_method none            (public client)
redirect_uris             {https://app.o7n.io/auth/callback}
grant_types               {authorization_code,refresh_token}
scopes                    NULL              (NULL = tüm scope'lara izin)
resource (bağlı)          https://app.o7n.io
reference_id              platform
```

> Prod'daki client_id **farklıdır** (her kayıt yeni id üretir). Prod client'ı
> `auth.mqdms.com/admin/oauth-clients` üzerinden oluşturulup `client_id`
> Coolify env'ine yazılmalıdır.

### Alpin tarafı (better-auth 1.7.1)

- Çözümlenen sürüm **better-auth 1.7.1** (`package.json` `^1.6.24`).
- `genericOAuth` plugin'i bu sürümde **core social provider** olarak çalışır:
  - giriş endpoint'i: `POST /api/auth/sign-in/social` (`provider: "mqdms"`)
  - callback endpoint'i: `GET /api/auth/callback/:providerId`
    → tam yol: `{BETTER_AUTH_URL}/api/auth/callback/mqdms`
- `redirectURI` config değeri hem authorize hem token isteğinde `redirect_uri`
  olarak kullanılır (`options.redirectURI` önceliklidir).
- `tokenUrlParams` → token isteğinin **gövdesine** eklenir.
  `authorizationUrlParams` → authorize URL'ine eklenir (rezerve parametreler
  `state/client_id/redirect_uri/response_type/code_challenge/nonce/scope`
  ezilemez; `resource` ezilebilir).
- PKCE varsayılan olarak **açık** (`pkce ?? true`).
- `account` tablosunda `issuer` kolonu **gerekli** (1.7.x). Alpin'in şemasında
  zaten var → **korunmalı**.
- `user.additionalFields` için `type: "string[]"` → postgres'ta
  `text(...).array()` kolonu kullanılmalı.
- Migration'lar `packages/db/drizzle` altından `drizzle-kit migrate` ile
  uygulanır (deploy'da `migrate` servisi çalıştırır). Bugün tek bir
  squashed `0000_illegal_korg.sql` var → **incremental `0001`** üretilecek.
- `packages/env` şeması **build sırasında** doğrulanıyor → yeni zorunlu env
  değişkenleri `docker-compose*.yml` build-arg'larına da eklenmeli.

## 2. Uygulama adımları

### 2.1 `packages/env/src/server.ts`

Yeni değişkenler (hepsi `MQDMS_` prefix'li):

```ts
MQDMS_ISSUER: z.url().default("https://auth.mqdms.com"),
MQDMS_CLIENT_ID: z.string().min(1, "MQDMS_CLIENT_ID is required"),
MQDMS_CLIENT_SECRET: optionalString,   // public client'ta boş bırakılır
MQDMS_REDIRECT_URI: optionalUrl,       // default: `${NEXT_PUBLIC_APP_URL}/api/auth/callback/mqdms`
MQDMS_RESOURCE: optionalUrl,           // default: `${NEXT_PUBLIC_APP_URL}`
```

Boş string'ler `undefined`'a çevrilmeli (mevcut `optionalUrl` deseninin
string varyantı).

### 2.2 `packages/auth/src/server.ts`

- `emailAndPassword`, `emailVerification`, `admin()`, `organization()`
  kaldırılır.
- `genericOAuth` eklenir:

```ts
genericOAuth({
  config: [
    {
      providerId: "mqdms",
      name: "MQDMS",
      clientId: env.MQDMS_CLIENT_ID,
      clientSecret: env.MQDMS_CLIENT_SECRET,       // public client → undefined
      discoveryUrl: `${env.MQDMS_ISSUER}/.well-known/oauth-authorization-server`,
      scopes: ["openid", "profile", "email", "offline_access", "permissions:read"],
      pkce: true,
      redirectURI: env.MQDMS_REDIRECT_URI,
      authorizationUrlParams: { resource: env.MQDMS_RESOURCE },
      tokenUrlParams: { resource: env.MQDMS_RESOURCE },
      overrideUserInfo: true,                      // her girişte claim'ler tazelenir
      mapProfileToUser: (profile) => ({
        organizationId: profile["https://auth.mqdms.com/organization"] ?? null,
        roles: profile["https://auth.mqdms.com/roles"] ?? [],
        permissions: profile["https://auth.mqdms.com/permissions"] ?? [],
        platformRole: profile["https://auth.mqdms.com/platform-role"] ?? "user",
      }),
    },
  ],
})
```

- `user.additionalFields` ile claim'ler user satırına yazılır:

```ts
user: {
  additionalFields: {
    organizationId: { type: "string", required: false, input: false },
    roles: { type: "string[]", required: false, input: false },
    permissions: { type: "string[]", required: false, input: false },
    platformRole: { type: "string", required: false, input: false },
  },
}
```

- `apiKey` plugin'i `references: "organization"` yerine `references: "user"`
  kullanmalı (organization plugin'i kalkınca "organization" referansı çalışmaz).
- `addJob`/`@alpin/queue` bağımlılığı auth server'ından düşer.

### 2.3 `packages/auth/src/client.ts`

- `adminClient()`, `organizationClient()` kaldırılır; `apiKeyClient()` kalır.
- `signInWithMqdms(callbackURL)` yardımcısı:
  `authClient.signIn.social({ provider: "mqdms", callbackURL })`.

### 2.4 `packages/db/src/schema/initial/auth.ts`

- Silinir: `organization`, `member`, `invitation` tabloları + ilişkileri,
  `session.activeOrganizationId`, `user.role/banned/banReason/banExpires`
  (admin plugin'i kalkıyor).
- `user` tablosuna eklenir:

```ts
organizationId: text("organization_id"),
roles: text("roles").array(),
permissions: text("permissions").array(),
platformRole: text("platform_role").default("user"),
```

- `account` tablosu **değişmez** (`issuer` better-auth 1.7.x için gerekli).

### 2.5 `packages/db/src/schema/initial/audit.ts`

- `audit_log.organization_id` üzerindeki `organization` FK'si kaldırılır;
  kolon düz `text` olarak kalır ve mqdms organizasyon id'sini tutar.

### 2.6 Migration

```
pnpm --filter @alpin/db db:generate   # → packages/db/drizzle/0001_*.sql + meta
```

### 2.7 Uygulama (`apps/qms`)

**Giriş**

- `features/auth/login-form.tsx` → tek buton: **"mqdms ile devam et"**.
  `authClient.signIn.social({ provider: "mqdms", callbackURL: next })`.
- `features/auth/schemas.ts` → `loginSchema`/`registerSchema`/... silinir.
- `features/auth/session.ts` → `getSession`/`requireSession` korunur; claim
  tabanlı yetki bağlamı eklenir:

```ts
export type AuthorizationContext = {
  organizationId: string | null;
  roles: string[];
  permissions: string[];
  platformRole: string;
};

export const getAuthorizationContext = cache(async (): Promise<AuthorizationContext> => {...});
export const requireOrganizationId = cache(async (): Promise<string> => {...}); // yoksa /no-workspace
export function hasPermission(ctx: AuthorizationContext, permission: string): boolean;
```

  Bu dosya yeni `features/authorization/server.ts` altına taşınabilir;
  `features/organization/server.ts` org API'lerini çağırdığı için **kaldırılır**.

**Silinen sayfalar / route'lar** (mqdms sahipliği)

| Silinen | Neden |
| --- | --- |
| `app/(auth)/register`, `forgot-password`, `reset-password`, `verify-email` | kayıt/şifre/doğrulama mqdms'te |
| `app/(flows)/accept-invitation` + `features/organization/accept-invitation.tsx` | davet mqdms'te |
| `app/(onboarding)/onboarding` + `layout` | organizasyon seçimi mqdms onayında |
| `app/(app)/organizations/new` | organizasyon oluşturma mqdms'te |
| `app/api/organization/**` | org CRUD mqdms'te |
| `features/organization/{create,delete,invite,member,settings,switcher,cancel-invitation}` | org yönetimi mqdms'te |
| `features/profile/change-password-form.tsx` | şifre mqdms'te |

**Değişen sayfalar**

- `app/(app)/layout.tsx` → `requireOrganizationId()`; başlıkta organizasyon id
  (ad claim'de yok) + `auth.mqdms.com` yönlendirmesi.
- `features/shell/app-sidebar.tsx` → `OrganizationSwitcher` yerine statik
  "Workspace" başlığı + mqdms bağlantısı.
- `app/(app)/dashboard/page.tsx` → üye listesi yerine claim'lerden gelen
  rol/izin/platform rolü gösterilir.
- `app/(app)/settings/page.tsx` → mqdms organizasyon ayarlarına link.
- `app/(app)/settings/members/page.tsx` → mqdms üyelerine link.
- `app/(app)/settings/api-keys/page.tsx` → user-scoped API key'ler.
- `app/(app)/settings/activity/page.tsx` → audit kayıtları claim org id ile.
- `app/(app)/settings/profile/page.tsx` → salt-okunur profil + mqdms link'i.
- `app/api/profile/route.ts` → silinir (profil güncelleme mqdms'te).
- Yeni: `app/no-workspace/page.tsx` → mqdms'te organizasyonu olmayan kullanıcı
  için bilgilendirme ekranı (oturum gerekli, organizasyon gerekli değil).

**i18n** (`packages/i18n/src/messages/{en,tr}.ts`)

- Yeni anahtarlar: `auth.login.continueWithMqdms`, `auth.login.mqdmsHint`,
  `auth.noWorkspace.*`, `auth.managedByMqdms`.
- Kullanılmayan register/forgot-password anahtarları silinir.

### 2.8 Env / deploy

- `.env.example` → `MQDMS_*` bloğu.
- `docker-compose.yml`, `docker-compose.prod.yml`,
  `docker-compose.coolify.yml` → `x-build-args` içine `MQDMS_ISSUER`,
  `MQDMS_CLIENT_ID`, `MQDMS_CLIENT_SECRET`, `MQDMS_REDIRECT_URI`,
  `MQDMS_RESOURCE` (build sırasında `@alpin/env` doğrulaması çalıştığı için
  **zorunlu**).
- `scripts/sync-env.mjs` → root `.env`'i `apps/qms/.env`'e senkronluyor; yeni
  değişkenlerin de taşındığı doğrulanmalı.

### 2.9 `auth-instruction` skill'i (yayınlanacak eser)

`.claude/skills/auth-instruction/SKILL.md` — akışın talimat halindeki
versiyonu: mqdms'e giriş, claim'lerin okunması, izin kontrolü, organization
bağlamı, hata senaryoları. Bu dosya `.claude/skills/mqdms-auth/SKILL.md` ile
birlikte yazılacaktır (mqdms kontratı + alpin'e uyarlanmış akış).

## 3. Prod kurulumu (Coolify → app.o7n.io)

1. `auth.mqdms.com/admin/oauth-clients` → **Alpin Web** client'ı:
   - redirect URI: `https://app.o7n.io/api/auth/callback/mqdms`
   - resource: `https://app.o7n.io` (client'a bağlı olmalı)
   - scope: `openid profile email offline_access permissions:read`
   - **public client** (`token_endpoint_auth_method: none`) → secret yok
   - `client_id`'yi kopyala
2. mqdms tarafında `OAUTH_TRUSTED_ORIGINS` içinde `https://app.o7n.io` olmalı.
3. Coolify env:
   ```
   MQDMS_ISSUER=https://auth.mqdms.com
   MQDMS_CLIENT_ID=<prod client_id>
   MQDMS_CLIENT_SECRET=            (public client → boş)
   MQDMS_REDIRECT_URI=https://app.o7n.io/api/auth/callback/mqdms
   MQDMS_RESOURCE=https://app.o7n.io
   ```
4. `main` branch'ine merge → Coolify deploy (migrate servisi şemayı uygular).

## 4. Doğrulama

```
pnpm --filter @alpin/db db:generate
pnpm typecheck
pnpm lint
pnpm build
```

Sonra `app.o7n.io` üzerinde: `/login` → "mqdms ile devam et" → mqdms giriş →
onay/organizasyon seçimi → alpin dashboard; claim'lerin session'a düştüğü
kontrol edilir.

## 5. Bilinen riskler / açık noktalar

- **Organizasyon adı yok.** Claim'lerde yalnızca id var; UI'da ad yerine id
  gösterilir ve yönetim mqdms'e bağlanır. Ad gerekirse mqdms tarafında
  `customUserInfoClaims`'e `.../organization-name` eklenebilir (ayrı iş).
- **Claim'ler giriş anında snapshot'lanır.** Rol/izin değişiklikleri bir
  sonraki girişe kadar alpin'e yansımaz. Yeni yetki kontrolü için
  mqdms introspection'ına gitmek gerekir (ileri faz).
- **Public client.** Prod client'ı confidential olursa
  `MQDMS_CLIENT_SECRET` dolu olmalı; ikisi birden verilmez.
- `account.issuer` kolonu better-auth 1.7.x için gerekli — **silinmemeli**.

## 6. Uygulama notları (plandan sapmalar)

Uygulama sırasında planın düzeltilmesi gereken üç nokta çıktı:

### 6.1 `additionalFields.input: false` claim'leri düşürür

Planda `input: false` öneriliyordu. Ancak better-auth 1.7.1'de
`parseAdditionalUserInputFromProviderProfile`, `input === false` olan alanları
provider profilinden **çıkarır**:

```ts
// better-auth/dist/db/schema.mjs
for (const key of Object.keys(profile)) {
  if (schema[key]?.input === false) continue;
  allowedProfileFields[key] = profile[key];
}
```

`input: false` kullanılsaydı claim'ler hiçbir zaman `user` satırına
yazılamazdı. Öte yandan `input` açık bırakılırsa istemci `POST /update-user`
ile kendine rol/izin yazabilir.

Çözüm: alanlar input'a açık bırakılır, istemci kaynaklı yazmalar veritabanı
hook'ları ile engellenir:

```ts
databaseHooks: {
  user: {
    create: { before: async (user, context) =>
      context?.path?.startsWith("/callback/")
        ? undefined
        : { data: { ...user, ...stripClaimFields() } } },
    update: { before: async (user, context) =>
      context?.path?.startsWith("/callback/")
        ? undefined
        : { data: { ...user, ...stripClaimFields() } } },
  },
}
```

`ctx.path` better-call router'da basePath (`/api/auth`) çıkarıldıktan sonraki
yol olduğu için callback'de `/callback/mqdms`'e eşittir.

### 6.2 Claim'ler ID token'da değil, userinfo'da

mqdms custom claim'leri access token payload'ına ve userinfo yanıtına yazar;
**ID token'a yazmaz**. better-auth'ın varsayılan `fetchUserInfo` akışı ID
token'ı tercih ettiği için claim'ler kaybolur. Bu yüzden `getUserInfo` elle
tanımlanır ve mqdms'in userinfo ucu okunur:

```ts
getUserInfo: async (tokens) => {
  const claims = await fetchMqdmsUserInfo(tokens.accessToken ?? "");
  if (!claims) return null;
  return {
    ...claims,
    email: claims.email ?? null,
    emailVerified: claims.email_verified === true,
    image: claims.picture ?? undefined,
    name: claims.name ?? undefined,
  };
}
```

### 6.3 İki migration üretildi

`user` tablosu hem kolon kazandı (4) hem kolon kaybetti (4). Drizzle-kit bu
durumda etkileşimli onay ister ve TTY olmadan üretilemez. Migration'lar iki
adımda üretildi:

- `0001_colorful_bloodstorm.sql` → org tabloları, `session.active_organization_id`,
  `user.role/banned/ban_reason/ban_expires` düşüşü
- `0002_huge_drax.sql` → `user.organization_id/roles/permissions/platform_role`

Doğrulama: `pnpm db:generate` → *"No schema changes, nothing to migrate"*.

### 6.4 Ek olarak yapılanlar

- `features/profile/**` (profil formu + şifre formu) tamamen silindi; profil
  sayfası salt-okunur ve mqdms'e bağlanır. `app/api/profile/route.ts` de
  silindiği için formun kalması anlamsızdı.
- `apps/qms/components/login-form.tsx` (kullanılmayan shadcn demo parçası)
  parola formu içerdiği için silindi.
- `app/faq/page.tsx` içindeki "şifre nasıl sıfırlanır" cevabı mqdms'e yönlendirildi.
- `migrate` servisi de `MQDMS_*` env'ine ihtiyaç duyuyor: `packages/db`
  `@alpin/env/server` şemasını import ediyor.
- `scripts/sync-env.mjs` artık kök `.env` içinde `MQDMS_CLIENT_ID` olup
  olmadığını doğruluyor; eksikse build'e sessizce düşmek yerine erken ve
  anlaşılır bir hata veriyor.
