# Developer Onboarding

Welcome. This repo is a full-stack SaaS starter that you can turn into a
specific product without rebuilding the world.

This document explains how to get set up locally in ~15–30 minutes.

---

## 1. Prerequisites

- Node.js 18+ (20+ recommended)
- pnpm (or npm / yarn)
- PostgreSQL (local instance or container)
- Git

Optional:
- Docker (for running Postgres via compose)

---

## 2. Clone & Install

```bash
git clone <REPO_URL>
cd <REPO_NAME>

# install dependencies
pnpm install
# or: npm install / yarn
```

---

## 3. Environment Variables

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Fill in at least:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/app_db"
   NEXTAUTH_SECRET="generated-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. For local-only development you can leave Stripe/SMTP as dummy values.

---

## 4. Database Setup

Make sure Postgres is running and accessible at `DATABASE_URL`, then:

```bash
npx prisma migrate dev
npx prisma generate
```

This will create the schema and generate the client.

Optional: run seeds (if present):

```bash
pnpm prisma:seed
```

---

## 5. Run the App

```bash
pnpm dev
```

Then open:

- http://localhost:3000 → marketing/landing
- http://localhost:3000/dashboard → protected dashboard (requires auth)

---

## 6. Auth Overview

The starter uses:

- `User`, `Account`, `Session` models in Prisma
- NextAuth-compatible schema

Check:

- `app/api/auth/[...nextauth]/route.ts` (or equivalent)
- `app/(auth)/sign-in` and `app/(auth)/sign-up` for UI

To wire real auth:

- Add provider credentials (e.g. Google, Email) to `.env`.
- Update the NextAuth config accordingly.

---

## 7. Where to Put Things

- **Pages / Routes**: `app/`
  - `(marketing)` → public marketing pages
  - `(auth)` → sign in/up
  - `(dashboard)` → authenticated app

- **Components**: `components/`
  - `components/layout` → layout shells (sidebar, topbar, etc.)
  - `components/ui` → primitive UI components

- **Domain Logic / Helpers**: `lib/`
- **DB Schema**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`

---

## 8. Turning This Into a Real Product

Use the "Project Conversion Checklist" and/or the "Autoboot Pack" if present:

- identify main entities (e.g. `Project`, `Client`, `Reading`)
- extend `schema.prisma`
- build one vertical slice (CRUD + UI)
- wire auth + billing where needed

---

## 9. Getting Help

If you are new to the codebase:

- Read:
  - `ARCHITECTURE.md`
  - `CODEBASE_MAP.md`
  - `CONTRIBUTING.md`
- Then pick a small part (e.g. one route or page) and trace it end-to-end.

This template is deliberately straightforward so you can focus on product logic,
not wrestling the framework.
