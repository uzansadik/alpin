---
name: mqdms-auth
description: mqdms merkezi kimlik sağlayıcısının (https://auth.mqdms.com) OAuth 2.1 / OIDC kontratı - endpoint'ler, discovery, scope'lar, yayınlanan claim'ler, RFC 8707 resource kullanımı, client kaydı ve public/private client farkları. mqdms'e bağlanan herhangi bir uygulama yazılırken, token/claim yorumlanırken veya "invalid_client / invalid_scope / invalid_target" hataları çözülürken kullan.
---

# mqdms OAuth Provider Referansı

mqdms, Better Auth 1.7.20 + `@better-auth/oauth-provider` 1.7.20 üzerine
kurulu bir **OAuth 2.1 / OIDC authorization server**'dır. Kullanıcı, organizasyon,
üyelik, rol ve izin yönetiminin tamamı mqdms'te tutulur; tüketen uygulamalar
yalnızca token alır ve claim'leri okur.

Issuer: `https://auth.mqdms.com`

## Endpoint'ler

| Amaç | Yol | Metot |
| --- | --- | --- |
| Discovery (AS) | `/.well-known/oauth-authorization-server` | GET |
| Discovery (OIDC) | `/.well-known/openid-configuration` | GET |
| Authorize | `/api/auth/oauth2/authorize` | GET |
| Token | `/api/auth/oauth2/token` | POST |
| UserInfo | `/api/auth/oauth2/userinfo` | GET (`Authorization: Bearer <access_token>`) |
| JWKS | `/api/auth/jwks` | GET |
| Introspect | `/api/auth/oauth2/introspect` | POST |
| Revoke | `/api/auth/oauth2/revoke` | POST |
| End session (RP-initiated logout) | `/api/auth/oauth2/end-session` | GET |

Tam URL'ler issuer ile birleştirilir: `https://auth.mqdms.com/api/auth/oauth2/token`.

## Akış (6 adım)

1. İstemci kullanıcıyı authorize endpoint'ine yönlendirir
   (`client_id`, `redirect_uri`, `scope`, `state`, PKCE `code_challenge`).
2. Kullanıcı mqdms'te giriş yapar.
3. Birden fazla organizasyonu varsa **organizasyon seçim** ekranı
   (`/oauth/organizations`) açılır; seçim `consentReferenceId` olur.
4. Kullanıcı **onay** verir (`/oauth/consent`).
5. mqdms `code` ile `redirect_uri`'ye döner.
6. İstemci `code` + `code_verifier` ile token endpoint'ine gider; access token
   JWT olarak döner.

## Scope'lar

`openid`, `profile`, `email`, `offline_access`, `permissions:read`.

`permissions:read` istenmezse rol/izin claim'leri yayınlanmaz.

## Yayınlanan claim'ler

RFC 9068 gereği URI ile adlandırılır; namespace `https://auth.mqdms.com`:

| Claim | Değer | Koşul |
| --- | --- | --- |
| `https://auth.mqdms.com/organization` | organizasyon id'si | onayda seçilen organizasyon |
| `https://auth.mqdms.com/roles` | rol listesi | `permissions:read` scope'u |
| `https://auth.mqdms.com/permissions` | izin listesi | `permissions:read` scope'u |
| `https://auth.mqdms.com/platform-role` | `user` \| `superadmin` | her zaman |

Claim'ler hem **access token JWT payload**'ında hem de **userinfo yanıtında**
(`customUserInfoClaims`) bulunur → tüketici userinfo'yu okuyabilir.

> Organizasyon **adı** yayınlanmaz, yalnızca **id** yayınlanır.

## PKCE ve client doğrulama

- PKCE **zorunlu**, `code_challenge_method=S256`.
- `redirect_uri` client'a kayıtlı `redirect_uris` içinde birebir eşleşmeli.
- Kayıtlı redirect URI'lerin origin'leri mqdms'in `OAUTH_TRUSTED_ORIGINS`
  listesinde de olmalı. Liste boşsa yalnızca `BETTER_AUTH_URL` origin'i güvenilirdir.
- Bilinmeyen client → `invalid_client`.
- Client'ın kayıtlı scope'ları `NULL` ise tüm scope'lara izin var; boş dizi
  (`{}`) ise **hiçbir** scope'a izin yoktur.

## RFC 8707 `resource`

`resource` parametresi authorize ve token isteklerinde desteklenir.

- Değer, kayıtlı bir `oauth_resource` olmalı ve **client'a bağlı** olmalı
  (`oauth_client_resource`).
- Bağlı değilse token isteği reddedilir (`invalid_target`).
- `resource` gönderildiğinde access token **JWT** olur ve `aud` = resource olur;
  claim'ler token payload'ından okunabilir.
- Authorize ve token istekinde **aynı** `resource` değeri olmalıdır.

## Client kaydı

Yalnızca platform superadmin'i (`platform-role = superadmin`):

- UI: `https://auth.mqdms.com/admin/oauth-clients`
- Admin API'leri (plugin): `/admin/oauth2/create-client`,
  `/oauth2/resources`, `/oauth2/update-client`, `/oauth2/delete-client`,
  `/oauth2/rotate-secret`, `/oauth2/rotate-keys`

Kayıt alanları: client name, redirect URI'lar (çok satırlı), resource'lar,
scope, `token_endpoint_auth_method`.

- **Secret yalnızca bir kez gösterilir** → saklanmalı, commit edilmemeli.
- `token_endpoint_auth_method: none` → **public client**: secret yok, PKCE
  zorunlu, token isteğinde yalnızca `client_id` gönderilir.
- `client_secret_basic` (varsayılan) → confidential client: secret zorunlu.
- Public client'a secret göndermek `invalid_client` üretir; confidential
  client'a secret göndermemek de `invalid_client` üretir.

## Hata ayıklama

| Hata | Sebep / çözüm |
| --- | --- |
| `invalid_client` | client_id yanlış, secret uyuşmuyor, public/confidential uyuşmazlığı, ya da client disable edilmiş |
| `invalid_scope` | client'ın scope listesinde istenen scope yok (veya resource'in `allowedScopes`'i ile kesişim boş) |
| `invalid_target` | `resource` kayıtlı değil ya da client'a bağlı değil |
| `redirect_uri` hatası | authorize'da kullanılan URI client'a kayıtlı değil; token isteğindeki `redirect_uri` authorize ile aynı olmalı |
| `issuer_mismatch` | callback'teki `iss` parametresi discovery issuer'ı ile eşleşmiyor |
| Claim'ler gelmiyor | `permissions:read` scope'u istenmemiş veya kullanıcı hâlâ üye değil (`getPublishedAuthorization` üyelik yoksa `null` döner) |
