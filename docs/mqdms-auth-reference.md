# mqdms Auth Referansı (alpin için)

Bu dosya, alpin'e geçiş sırasında doğrulanan **mqdms** sözleşmesinin özetidir.
Kaynak: `.claude/skills/mqdms-auth/SKILL.md` (daha geniş anlatım) ve
`.claude/skills/auth-instruction/SKILL.md` (alpin'e uyarlanmış akış).

## Issuer ve endpoint'ler

Issuer: `https://auth.mqdms.com`

```
GET  /.well-known/oauth-authorization-server   (AS discovery)
GET  /.well-known/openid-configuration         (OIDC discovery)
GET  /api/auth/oauth2/authorize
POST /api/auth/oauth2/token
GET  /api/auth/oauth2/userinfo
GET  /api/auth/jwks
POST /api/auth/oauth2/introspect
POST /api/auth/oauth2/revoke
GET  /api/auth/oauth2/end-session
```

Scope'lar: `openid profile email offline_access permissions:read`.
PKCE zorunlu (`S256`).

## Claim'ler

Namespace: `https://auth.mqdms.com`

| Claim | İçerik |
| --- | --- |
| `.../organization` | organizasyon id'si (ad **yok**) |
| `.../roles` | rol listesi (`permissions:read` gerekir) |
| `.../permissions` | izin listesi (`permissions:read` gerekir) |
| `.../platform-role` | `user` \| `superadmin` |

Claim'ler access token JWT payload'ında **ve** userinfo yanıtında bulunur.

## "Alpin Web" client'ı (yerel mqdms DB, `oauth_client`)

```
client_id                   dSkqGeVJENeqZktGLRyoyioEqbrmQCDo
client_secret               NULL
token_endpoint_auth_method  none        (public client)
redirect_uris               {https://app.o7n.io/auth/callback}
grant_types                 {authorization_code,refresh_token}
scopes                      NULL        (NULL = tüm scope'lara izin)
reference_id                platform
```

Bağlı resource (`oauth_resource` → `oauth_client_resource`):

```
identifier  https://app.o7n.io
```

> Prod client_id farklıdır; `auth.mqdms.com/admin/oauth-clients` üzerinden
> oluşturulup env'e yazılmalıdır. Prod redirect URI'si better-auth'ın gerçek
> callback yoludur: `https://app.o7n.io/api/auth/callback/mqdms`.

## better-auth 1.7.1 tarafındaki kritik davranışlar

- `genericOAuth` artık **core social provider**: giriş `POST
  /api/auth/sign-in/social`, callback `GET /api/auth/callback/:providerId`.
- `redirectURI` config değeri hem authorize hem token isteğinde kullanılır.
- `tokenUrlParams` → token gövdesine eklenir (`resource` buradan).
  `authorizationUrlParams` → authorize URL'ine eklenir.
- PKCE varsayılan açık; `pkce: true` yazmak yeterli.
- `account.issuer` kolonu 1.7.x için **gerekli** → silinmemeli.
- `user.additionalFields` `string[]` → postgres'ta `text(...).array()`.
