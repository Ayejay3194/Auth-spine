# Architecture Overview

This codebase is structured as a modular full-stack SaaS application.

At a high level:

- **Frontend**: Next.js (App Router) + React + Tailwind
- **Backend**: Next.js route handlers / server actions
- **Database**: PostgreSQL via Prisma
- **Auth**: NextAuth-compatible models
- **Multi-tenancy**: Workspace-based
- **Billing**: Stripe-ready subscription model

---

## Top-Level Layout

- `app/` — application routes (frontend + server components)
- `components/` — shared UI and layout components
- `lib/` — utilities, validation, domain helpers
- `prisma/` — database schema and migrations
- `public/` — static assets
- `scripts/` — helper scripts (bootstrap, migrations, etc.)
- `tools/` — small CLIs for scaffolding

---

## App Router Structure

Within `app/` we use route groups:

- `(marketing)`  
  Public pages: landing, pricing, docs, etc.

- `(auth)`  
  Authentication pages: sign-in, sign-up, passwordless links, etc.

- `(dashboard)`  
  Authenticated application:
  - `/dashboard` → overview / home
  - `/dashboard/settings` → user/workspace settings
  - `/dashboard/billing` → subscription & billing
  - `/dashboard/admin` → workspace-level admin area
  - feature pages (e.g. `/dashboard/projects`, `/dashboard/clients`) live here.

Each `(dashboard)` route is intended to be protected via auth and scoped to a workspace.

---

## Data & Multi-Tenancy

Prisma schema (simplified):

- `User` — individual account
- `Workspace` — container for data and configuration
- `WorkspaceMember` — link between `User` and `Workspace` with a role
- `Subscription` — billing/subscription state for a workspace

Your domain models (e.g. `Project`, `Client`, `Reading`) should reference `Workspace`:

```prisma
model Project {
  id          String   @id @default(cuid())
  workspaceId String
  name        String
  status      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId])
}
```

All queries in server-side code should be scoped by `workspaceId` to ensure isolation.

---

## Auth Flow

- Routes under `(auth)` handle user onboarding.
- NextAuth (or equivalent) uses:
  - `User`, `Account`, `Session`, `VerificationToken` models.
- Authenticated server code should:
  - read the current session
  - resolve the active workspace
  - enforce role-based access if needed (OWNER/ADMIN/MEMBER/VIEWER).

---

## Billing

The Stripe-ready part uses:

- `Subscription` model tied 1:1 with `Workspace`
- API routes for:
  - creating checkout sessions
  - accessing the Stripe customer portal
- Webhook route to sync subscription status into the DB.

This is intentionally left as scaffolding so you can wire your own Stripe keys
and plan logic.

---

## Extension Points

You are expected to extend:

- `prisma/schema.prisma` with your domain models
- `app/(dashboard)` with feature pages for those models
- `lib/validation` with Zod schemas for inputs
- `components/` with domain-specific UI

If you see starter pages like "placeholder" or "TODO", they are meant as
safe anchors for new development rather than production logic.
