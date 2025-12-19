# Supabase SaaS/PaaS Advanced Pack

This repo is a **starter enforcement layer** for building a multi-tenant SaaS on Supabase + Postgres.
It does **not** magically enable every Postgres feature in your checklist (some are Postgres-native, some are Supabase product features, some require custom code),
but it gives you the **patterns + scaffolding** so you can actually ship it without cross-tenant leaks.

## What's inside

### Database (SQL / migrations)
- Tenant isolation tables + helper functions
- RLS policies (tenant-context enforced)
- Audit log with tamper-evident chaining
- Quotas + usage counters
- API keys (hash-only storage) + scope checks
- Example partitioning/indexing patterns
- Triggers: updated_at, immutable fields, audit hooks

### Edge Functions (Deno)
- `webhook-verify` (HMAC signature + replay protection skeleton)
- `rate-limit` (per-tenant/per-key limiter; plug in Redis/Upstash later)
- `signed-upload` (create signed upload URL policies)
- `cron-quota-sweep` (scheduled quota enforcement job)
- `admin-support-jit` (support access request/approve/expire)

### App integration snippets
- Next.js middleware security headers + CSP
- Tenant context derivation pattern
- Client/server Supabase helpers

### Testing
- SQL policy tests (pgTAP-style template)
- Vitest unit tests for edge functions
- A basic CI workflow skeleton

---

## Quick start (local)
1. Install Supabase CLI.
2. `supabase init`
3. Copy this pack into your repo (or use as a base).
4. `supabase start`
5. Apply migrations:
   - `supabase db reset`

> The SQL here is written to be readable and auditable.
> You should adapt table names + claims mapping to your auth model.

---

## Key idea: Tenant context on every request
- **DB side**: `request.tenant_id()` reads a tenant id from JWT claims (preferred) or request headers (dev only).
- **RLS**: every table policy checks `tenant_id = request.tenant_id()`.
- **App**: you set tenant claim on login (custom JWT / auth hook) or route through an edge function that mints a scoped session.

See: `supabase/migrations/0001_tenant_core.sql`

---

## Files to read first
- `supabase/migrations/0001_tenant_core.sql`
- `supabase/migrations/0002_rls_policies.sql`
- `supabase/migrations/0003_audit_logs.sql`
- `supabase/functions/webhook-verify/index.ts`
- `next/middleware.ts` (security headers)
