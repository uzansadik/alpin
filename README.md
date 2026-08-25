# Upkick

Upkick is a reusable SaaS starter built for creating new applications without rebuilding authentication, organizations, billing, storage, email, and common account management features.

## Stack

* Next.js
* Turborepo
* pnpm
* PostgreSQL
* Drizzle ORM
* Better Auth
* Better Auth Organizations
* Polar
* Cloudflare R2 / S3-compatible storage
* Resend
* shadcn/ui
* React Hook Form
* Zod
* Biome

## Project structure

```text
apps/
  web/

packages/
  auth/
  config/
  db/
  email/
  env/
  storage/
  typescript-config/
  ui/
```

Application-specific features live inside `apps/web/features`.

Infrastructure packages should remain framework-independent where possible.

For example:

```text
apps/web
    ↓
@upkick/storage
    ↓
S3-compatible provider
```

and:

```text
apps/web
    ↓
@upkick/auth
    ↓
Better Auth
    ↓
Polar
```

---

# Getting started

## 1. Requirements

Install:

* Node.js
* pnpm
* PostgreSQL

Optional external services used by the starter:

* Resend
* Cloudflare R2
* Polar

For local development, PostgreSQL should preferably run locally.

---

## 2. Install dependencies

From the repository root:

```bash
pnpm install
```

---

## 3. Environment variables

Copy:

```text
.env.example
```

to:

```text
.env
```

The root `.env` file is the canonical environment file.

Upkick synchronizes it to:

```text
apps/web/.env
```

when development starts.

Do not manually maintain separate copies of the same variables.

---

# Database

Create a local PostgreSQL database.

Example:

```text
Database: upkick
Host: localhost
Port: 5432
```

Then configure:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/upkick
```

Run the repository's Drizzle database initialization/migration command before starting the application.

Local development should use a local PostgreSQL instance whenever possible.

The application and database should also be deployed in the same or a nearby region in production.

---

# Development

Start the complete monorepo:

```bash
pnpm dev
```

The root command first synchronizes environment variables and then starts the Turborepo development tasks.

Web application:

```text
http://localhost:3000
```

---

# Authentication

Authentication is implemented with Better Auth.

Included flows:

* Register
* Login
* Email verification
* Forgot password
* Reset password
* Change password
* Session management
* Sign out
* Organization invitations

The `@upkick/auth` package must not depend on Next.js APIs such as:

```text
next/headers
next/navigation
redirect()
```

Next.js-specific authentication helpers belong in:

```text
apps/web/features/auth
```

---

# Organizations

Organizations are the primary application workspace / tenant abstraction.

Included functionality:

* Organization onboarding
* Create organization
* Switch active organization
* Organization name
* Organization slug
* Organization logo
* Invite members
* Pending invitations
* Accept invitation
* Promote member to admin
* Demote admin to member
* Remove member
* Delete organization

Roles:

```text
owner
admin
member
```

Sensitive organization settings such as billing and organization deletion are owner-only.

Application resources should generally belong to an organization rather than directly to a user.

Example:

```text
project.organizationId
document.organizationId
```

instead of:

```text
project.userId
document.userId
```

when the resource belongs to a workspace.

---

# Storage

Storage is exposed through `@upkick/storage`.

The web application does not depend directly on AWS SDK or Cloudflare R2.

Uploads use presigned URLs:

```text
Browser
    ↓
POST presign
    ↓
signed PUT URL
    ↓
Browser → R2 / S3
    ↓
POST complete
    ↓
server-side object verification
```

Current examples:

```text
user-avatar/{userId}/{uuid}
organization-logo/{organizationId}/{uuid}
```

Uploaded image types:

* JPEG
* PNG
* WebP

Default maximum image size:

```text
5 MB
```

The server verifies uploaded objects before they are persisted to application records.

---

# Email

Email is exposed through `@upkick/email`.

Current provider:

```text
Resend
```

Included examples:

* Email verification
* Password reset
* Organization invitation

Application code should use the email package instead of importing Resend directly.

---

# Billing

Billing uses the Better Auth Polar plugin.

Polar handles:

* Customers
* Products
* Checkouts
* Subscriptions
* Customer Portal
* Benefits
* Usage meters
* Credits
* Orders
* Webhooks

The starter intentionally avoids implementing a second billing system on top of Polar.

## Customer model

With the default Better Auth Polar integration:

```text
Better Auth User
      ↓
Polar Customer
```

Polar uses the Better Auth user ID as the customer's external ID.

## Organization subscriptions

An organization purchase is associated using:

```text
referenceId = organization.id
```

Example:

```ts
await authClient.checkout({
  slug: "pro-monthly",
  referenceId: organization.id,
});
```

This allows the same user to own or belong to multiple organizations with separate subscriptions.

Example:

```text
Sadık
│
├─ Organization A
│     └─ Pro Monthly
│
└─ Organization B
      └─ Pro Yearly
```

The Polar customer is still the user, while each subscription is associated with its organization through `referenceId`.

---

# Example products

The starter contains example Polar products.

```text
Pro Monthly
Pro Yearly
500 AI Credits
```

These are examples, not mandatory Upkick business rules.

A developer can replace them with:

* API usage
* Storage
* Processing minutes
* Documents
* Emails
* Seats
* AI usage
* Credits
* Any other Polar product or meter

---

# Feature access example

Upkick includes an example of restricting a page to an organization with an active subscription.

Conceptually:

```text
Request premium page
      ↓
Get active organization
      ↓
Query Polar subscriptions
      ↓
referenceId = organization.id
      ↓
active subscription?
      ↓
yes → allow
no  → redirect to billing
```

Feature access must be enforced server-side.

Client-side visibility checks are only for user experience and must not be treated as authorization.

---

# Usage and credits example

The starter includes AI credits only as an example of Polar usage-based billing.

Example meter:

```text
AI Credits
```

Example event:

```text
ai_usage
```

Example:

```ts
await authClient.usage.ingest({
  event: "ai_usage",
  metadata: {
    credits: 3,
  },
});
```

The Polar usage plugin automatically associates usage with the authenticated Polar customer.

Therefore the default example is customer/user scoped.

Organization-shared usage such as:

```text
Organization storage: 2 TB

Member A uploads 1 GB
Member B uploads 500 MB
Member C uploads 10 GB
```

requires application-specific organization-level billing logic or a Polar SDK extension.

Upkick intentionally leaves that policy to the application developer.

---

# Seats

Polar supports seat-based billing.

Upkick does not implement its own seat engine.

A SaaS may choose to combine:

```text
Better Auth Organization Membership
+
Polar Seat Billing
```

but they represent different concepts:

```text
Better Auth Member
= workspace membership

Polar Seat
= paid billing entitlement
```

The application decides how these concepts map to each other.

---

# Monthly and yearly subscriptions

Monthly and yearly products represent billing intervals, not necessarily different application plans.

Example:

```text
Pro Monthly
Pro Yearly
```

both represent:

```text
Pro
```

but use different billing intervals.

Application access logic should avoid unnecessarily duplicating features based on billing interval.

---

# Polar Sandbox

Use:

```env
POLAR_SERVER=sandbox
```

for local development.

Sandbox products, access tokens, customers, subscriptions, and webhook secrets are separate from production.

When creating organization-specific purchases, pass the active organization ID as the checkout `referenceId`.

---

# Polar webhooks

Webhook handling is provided by the Better Auth Polar plugin.

For the standard Upkick Better Auth route:

```text
/api/auth/polar/webhooks
```

Configure the Polar Sandbox webhook endpoint to point to your publicly accessible application URL.

For local testing, a temporary Cloudflare Tunnel can be used:

```bash
cloudflared tunnel --url http://localhost:3000
```

Then configure Polar with:

```text
https://your-tunnel.trycloudflare.com/api/auth/polar/webhooks
```

Store the webhook signing secret in:

```env
POLAR_WEBHOOK_SECRET=
```

---

# Profile and account

Included account functionality:

* Update name
* Upload avatar
* Change password
* List active sessions
* Revoke a session
* Revoke other sessions

Profile images are uploaded through the same verified storage pipeline used by organization logos.

---

# UI conventions

Use the existing shadcn components from:

```text
@upkick/ui/components/*
```

Do not recreate Button, Input, Field, or other shared UI components inside the web application.

Forms use:

```text
react-hook-form
+
zod
+
zodResolver
+
Controller
+
Field
FieldLabel
FieldError
FieldGroup
```

Do not use the deprecated shadcn `Form` / `FormField` pattern.

---

# TypeScript conventions

The repository uses:

```text
module: ESNext
moduleResolution: Bundler
```

Relative TypeScript imports do not include `.js` extensions.

Correct:

```ts
import { something } from "./something";
```

Avoid:

```ts
import { something } from "./something.js";
```

Biome is the source of truth for formatting and import organization.

---

# Environment conventions

Deployment environment is represented by:

```env
APP_ENV=local
```

Supported values:

```text
local
staging
production
```

Do not use `NODE_ENV` as a custom deployment environment selector.

---

# Design principles

## Keep infrastructure isolated

Application code should not know unnecessary provider details.

Examples:

```text
apps/web
→ @upkick/storage
→ S3-compatible provider
```

```text
apps/web
→ @upkick/email
→ Resend
```

```text
apps/web
→ @upkick/auth
→ Better Auth + Polar
```

## Prefer provider capabilities

Do not rebuild features that Polar, Better Auth, PostgreSQL, R2, or another provider already implements well.

## Keep business rules application-specific

Upkick may provide examples such as:

```text
Pro premium page
AI credits
seat billing
storage limits
```

but these examples should not become mandatory framework rules.

The application developer owns domain-specific decisions.

## Server-side authorization

UI visibility is not authorization.

Protect sensitive functionality on the server, including:

* Premium pages
* Organization settings
* Billing
* Organization deletion
* Member management
* Upload verification

---

# Current starter scope

Upkick currently provides a working reference for:

```text
Authentication
Organizations
Memberships
Invitations
Profiles
Password management
Sessions
Email
Storage
Organization branding
Billing
Subscriptions
Usage examples
Premium access
```

The goal is to provide a clean SaaS foundation while leaving product-specific domain logic to the application built on top of it.
