---
name: auth-instruction
description: Alpin'in mqdms'e (https://auth.mqdms.com) bağlanan OAuth/OIDC kimlik akışının talimatı - alpin bir OAuth client'ıdır, kendi kullanıcı/organizasyon modelini tutmaz; giriş, claim okuma, izin kontrolü, yeni sayfa koruma ve client kaydı kuralları. Alpin'de auth, oturum, login, izin/permission, organization veya mqdms entegrasyonu üzerinde çalışırken kullan.
---

# Alpin Auth Talimatı

Alpin, kimlik doğrulamasını **mqdms**'ten alır. mqdms, Better Auth 1.7.20 +
`@better-auth/oauth-provider` 1.7.20 üzerine kurulu bir OAuth 2.1 / OIDC
authorization server'dır ve kullanıcı/organizasyon/rol/izin yönetiminin
**tek sahibidir**. Alpin yalnızca bir **OAuth Resource Server / Client**'tır.

> mqdms kontratının ayrıntılı referansı: `mqdms-auth` skill'i.

## Değişmez kurallar

1. **Alpin'de parola yok.** `emailAndPassword`, `admin()` ve `organization()`
   plugin'leri kullanılmaz; `register` / `forgot-password` / `reset-password` /
   `verify-email` sayfaları yoktur.
2. **Alpin'de organizasyon modeli yok.** `organization`, `member`, `invitation`
   tabloları ve organizasyon CRUD UI'ı kaldırılmıştır. Organizasyon
   üyeliği/rolü/ayarları `auth.mqdms.com` üzerinden yönetilir.
3. **Organizasyon kimliği mqdms claim'idir.**
   `https://auth.mqdms.com/organization` → alpin `user.organization_id`
   kolonu. Bu bir *referans* alanıdır, alpin'de organizasyon kaydı tutulmaz.
4. **Yetki kararı mqdms'in RBAC katmanındadır.** Alpin claim'leri okur,
   kendi rol kataloğu tutmaz. İzin listesi mqdms'in `permissions:read`
   scope'u ile gelir.
5. **Secret'lar ortam değişkenidir.** `MQDMS_CLIENT_SECRET` asla commit
   edilmez. Public client kullanılıyorsa boş bırakılır.
6. **Her `redirect_uri` mqdms'e kayıtlı olmalıdır.** Kayıtsız URI →
   `invalid_request`. Prod URI'si:
   `https://app.o7n.io/api/auth/callback/mqdms`.
7. **Access token'ı istemciye sızdırma.** Token'lar `account` tablosunda
   better-auth tarafından şifrelenir; log'a yazılmaz.

## Akış

```
[Alpin /login]  →  authClient.signIn.social({ provider: "mqdms", callbackURL })
        │
        ▼  tarayıcı yönlendirmesi
[mqdms /api/auth/oauth2/authorize]  →  giriş → organizasyon seçimi → onay
        │
        ▼  code + state
[Alpin /api/auth/callback/mqdms]  →  token değişimi (PKCE) → userinfo → session
        │
        ▼
[Alpin /dashboard]  session.user.organizationId / roles / permissions / platformRole
```

### Dosya haritası

| Konu | Dosya |
| --- | --- |
| Sunucu tarafı auth config | `packages/auth/src/server.ts` |
| İstemci tarafı auth client | `packages/auth/src/client.ts` |
| Next.js handler | `packages/auth/src/next.ts` → `app/api/auth/[...all]/route.ts` |
| Env şeması | `packages/env/src/server.ts` (`MQDMS_*`) |
| Kullanıcı tablosu + claim kolonları | `packages/db/src/schema/initial/auth.ts` |
| Oturum okuma | `apps/qms/features/auth/session.ts` |
| Yetki bağlamı | `apps/qms/features/authorization/server.ts` |
| Giriş ekranı | `apps/qms/features/auth/login-form.tsx` |

## Claim'ler nereye yazılır?

`genericOAuth` plugin'i `mapProfileToUser` ile mqdms userinfo yanıtındaki
claim'leri `user` satırına yazar:

| mqdms claim'ı | alpin kolonu | tip |
| --- | --- | --- |
| `https://auth.mqdms.com/organization` | `user.organization_id` | text |
| `https://auth.mqdms.com/roles` | `user.roles` | text[] |
| `https://auth.mqdms.com/permissions` | `user.permissions` | text[] |
| `https://auth.mqdms.com/platform-role` | `user.platform_role` | text |

`overrideUserInfo: true` sayesinde claim'ler her girişte tazelenir. Session
üzerinden okunur: `session.user.organizationId`, `session.user.roles`,
`session.user.permissions`, `session.user.platformRole`.

## Yetki bağlamı

```ts
// apps/qms/features/authorization/server.ts
import { cache } from "react";

import { getSession } from "@/features/auth/session";

export type AuthorizationContext = {
  organizationId: string | null;
  roles: string[];
  permissions: string[];
  platformRole: string;
};

export const getAuthorizationContext = cache(async (): Promise<AuthorizationContext> => {
  const session = await getSession();

  if (!session) {
    return { organizationId: null, roles: [], permissions: [], platformRole: "user" };
  }

  return {
    organizationId: session.user.organizationId ?? null,
    roles: session.user.roles ?? [],
    permissions: session.user.permissions ?? [],
    platformRole: session.user.platformRole ?? "user",
  };
});
```

### İzin kontrolü

```ts
export function hasPermission(ctx: AuthorizationContext, permission: string) {
  return ctx.permissions.includes(permission);
}
```

- Denetimler **her zaman** mqdms'in yayınladığı izin listesiyle yapılır.
- `platform-role === "superadmin"` mqdms'in platform yetkisidir; alpin'de
  ayrı bir "admin" rolü tutulmaz.
- Kullanıcının mqdms'te organizasyon üyeliği yoksa `organization` claim'i
  yayınlanmaz → `organizationId` boş olur → uygulama `/no-workspace`
  ekranına yönlendirir.

## Yeni sayfa veya route koruma

```ts
// Sunucu bileşeni / route handler
import { requireSession } from "@/features/auth/session";
import { requireOrganizationId, hasPermission } from "@/features/authorization/server";

const session = await requireSession();          // oturum yoksa /login
const organizationId = await requireOrganizationId(); // org yoksa /no-workspace
const ctx = await getAuthorizationContext();

if (!hasPermission(ctx, "project:delete")) {
  redirect("/dashboard");
}
```

- Layout'lar `apps/qms/app/(app)/layout.tsx` içinde oturum + organizasyon
  kontrolü yapar; alt sayfalar ek kontrol gerektirmez.
- `redirect()` Next 16'da `try/catch` **dışında** çağrılmalıdır (throw
  ederek çalışır). `node_modules/next/dist/docs/` altındaki güncel rehbere
  bakmadan route handler yazılmaz.

## Client kaydı (mqdms tarafı)

`auth.mqdms.com/admin/oauth-clients` → client kaydı:

| Alan | Değer |
| --- | --- |
| Name | `Alpin Web` |
| Redirect URI | `https://app.o7n.io/api/auth/callback/mqdms` |
| Resource | `https://app.o7n.io` (client'a bağlı olmalı) |
| Scope | `openid profile email offline_access permissions:read` |
| Token endpoint auth | `none` (public client) → secret yok |

Kayıt sonrası `client_id` Coolify env'ine `MQDMS_CLIENT_ID` olarak yazılır.
Secret **yalnızca bir kez** gösterilir; public client kullanılmıyorsa
`MQDMS_CLIENT_SECRET` ile saklanır.

## Env

```
MQDMS_ISSUER=https://auth.mqdms.com
MQDMS_CLIENT_ID=<client_id>
MQDMS_CLIENT_SECRET=            # public client → boş
MQDMS_REDIRECT_URI=https://app.o7n.io/api/auth/callback/mqdms
MQDMS_RESOURCE=https://app.o7n.io
```

`packages/env/src/server.ts` build sırasında doğrulanır → yeni env
değişkeni eklenirse `docker-compose*.yml` build-arg listeleri de güncellenir.

## Yeni mqdms claim'i eklenirse

1. mqdms tarafında claim'i `customAccessTokenClaims` ve `customUserInfoClaims`
   içine ekle.
2. Alpin'de `packages/db/src/schema/initial/auth.ts` → `user` tablosuna kolon
   ekle, `packages/auth/src/server.ts` içindeki `mapProfileToUser`'a eşle.
3. `pnpm --filter @alpin/db db:generate` ile migration üret.
4. `features/authorization/server.ts` içindeki `AuthorizationContext` tipini
   güncelle.

## Sık karşılaşılan hatalar

| Belirti | Sebep | Çözüm |
| --- | --- | --- |
| `invalid_client` | client_id yanlış / secret uyuşmuyor / public-confidential karışmış | client kaydı ile env'i karşılaştır |
| `invalid_scope` | client scope listesinde istenen scope yok | client'a scope ekle (boş dizi = hiçbir scope yok) |
| `invalid_target` | `resource` kayıtlı değil ya da client'a bağlı değil | resource'u client'a bağla |
| `redirect_uri` reddi | authorize URI'si client'a kayıtlı değil | URI'yi `MQDMS_REDIRECT_URI` ile birebir eşle |
| Claim'ler boş | `permissions:read` istenmemiş veya üyelik yok | scope ekle; mqdms'te üyeliği doğrula |
| Login düğmesi 404 | `/api/auth/[...all]` route'u eksik | `packages/auth/src/next.ts` bağlansın |
