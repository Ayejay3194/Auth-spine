# Admin Diagnostics Pack (Fail-Proof Ops Panel)

Drop-in Admin panel + API routes for running safety checks:
- DB health (Postgres/Prisma or generic)
- Redis health
- Queue/DLQ health (stub adapter)
- Audit log write/read (adapter)
- Tenant isolation smoke (adapter)
- Webhook replay (Stripe example stub)
- Permissions matrix report (static + adapter hook)

## Where to place
Merge these into your Next.js App Router repo:

- app/admin/diagnostics/page.tsx
- app/api/admin/diagnostics/* (route handlers)
- src/admin/diagnostics/* (UI + adapters + types)

## Install deps
- If you use Prisma: `@prisma/client`
- If you use Redis: `ioredis` (or swap adapter)
- If you use NextAuth: already fine; otherwise wire your auth in `src/admin/diagnostics/auth.ts`

## Configure env
Copy `.env.diagnostics.example` -> `.env` (or your secrets store)

## Security
- All endpoints require `role=admin|owner` (server-side check).
- Every diagnostics run emits an audit event through the audit adapter.

## Customize
Implement/replace adapters:
- `src/admin/diagnostics/adapters/db.ts`
- `src/admin/diagnostics/adapters/redis.ts`
- `src/admin/diagnostics/adapters/queue.ts`
- `src/admin/diagnostics/adapters/audit.ts`
- `src/admin/diagnostics/adapters/tenant.ts`
- `src/admin/diagnostics/adapters/webhooks.ts`
