# Codebase Map

This document gives you a fast "where is what" tour of the repo.

---

## Root

- `package.json` — scripts and dependencies
- `tsconfig.json` — TypeScript config
- `next.config.mjs` — Next.js config
- `tailwind.config.mjs` — Tailwind theme and scanning config
- `postcss.config.mjs` — PostCSS + Tailwind
- `.env.example` — environment variable template
- `prisma/` — database schema and migrations
- `.github/workflows/` — CI pipelines (if present)
- `scripts/` — utility scripts (bootstrap, migrate, etc.)
- `tools/` — small CLIs (e.g. entity generator)

---

## `app/` (Routes)

- `app/layout.tsx` — root layout, globals, theme wrapper
- `app/(marketing)/page.tsx` — marketing/landing page
- `app/(auth)/sign-in/page.tsx` — sign-in page
- `app/(auth)/sign-up/page.tsx` — sign-up page
- `app/(dashboard)/layout.tsx` — main app shell (sidebar + topbar)
- `app/(dashboard)/page.tsx` — dashboard home
- `app/(dashboard)/settings/page.tsx` — settings placeholder
- `app/(dashboard)/billing/page.tsx` — billing placeholder
- `app/(dashboard)/admin/page.tsx` — admin placeholder

You will typically add new feature pages here, e.g.:

- `app/(dashboard)/projects/page.tsx`
- `app/(dashboard)/clients/page.tsx`

---

## `components/`

- `components/layout/sidebar.tsx` — navigation sidebar
- `components/layout/topbar.tsx` — top bar (title, theme toggle, user controls)
- `components/auth/sign-in-form.tsx` — sign-in form UI
- `components/auth/sign-up-form.tsx` — sign-up form UI
- `components/ui/mode-toggle.tsx` — light/dark toggle

This is where you add:

- domain-specific UI
- shared input components
- tables, cards, modals, etc.

---

## `lib/`

- `lib/cn.ts` — helper to join class names

You should add:

- `lib/validation/` — Zod schemas for API/server actions
- `lib/auth/` — auth helpers (get current user, workspace, etc.)
- `lib/logger.ts` — logging wrapper
- any domain-specific helpers (formatters, mappers, etc.)

---

## `prisma/`

- `prisma/schema.prisma` — all database models
- `prisma/migrations/` — generated migration files

You should:

- add your own models here
- always use `npx prisma migrate dev` to change schema

---

## `scripts/`

This folder is meant for utility scripts, for example:

- `scripts/bootstrap.sh` — initial setup helper
- `scripts/migrate_and_seed.sh` — db helper script

---

## `tools/`

- `tools/saas-cli.js` — small CLI that can:
  - `init-env` — copy `.env.example` → `.env`
  - `add-entity` — create starter page + validation stub for a new entity

You can extend this for repeated tasks.

---

If you are ever lost:

1. Start at `app/(dashboard)/page.tsx`.
2. See what components it imports.
3. Jump into those components and follow the imports.
4. For data: search in `app/` for `prisma.` or your model names.
