# Supabase Advanced Features Pack (Next.js + TypeScript)

This is a **modular, copy-pasteable** kit that turns your "giant checklist" into actual building blocks.

## What you get
- **SQL**: extensions, monitoring views, audit logging, RLS policy patterns, storage policies
- **Edge Functions (Deno TS)**: middleware chain, auth gate, rate-limit interface, webhook sender, cron-ready jobs
- **TypeScript SDK layer**: strongly typed DB access helpers, realtime/presence wrappers, storage helpers
- **Tests**: starter harness for DB/RLS + API style tests (Vitest)

## Repo layout
- `packages/supabase-kit/` → the actual modules
- `apps/web/` → minimal Next.js app showing how to wire the modules
- `docs/` → operational notes, playbooks, and checklists

## Quick start
1. Install deps (pnpm recommended):
   - `pnpm i`
2. Copy SQL into your Supabase project:
   - `packages/supabase-kit/sql/` (run in SQL editor) and/or `migrations/`
3. Deploy Edge Functions:
   - `packages/supabase-kit/edge-functions/`
4. Use the TypeScript modules in your app:
   - `packages/supabase-kit/src/`

## Modules map (cheat sheet)
- **DB Admin / Metrics**: `sql/monitoring_views.sql`
- **Fuzzy search / trigram / levenshtein**: `sql/extensions.sql` + `sql/search_helpers.sql`
- **Audit Trail (append-only)**: `sql/audit.sql`
- **Storage policies / signed URLs patterns**: `sql/storage_policies.sql` + `src/storage/*`
- **Realtime presence + broadcast wrappers**: `src/realtime/*`
- **Edge function middleware + auth**: `edge-functions/_shared/*`

