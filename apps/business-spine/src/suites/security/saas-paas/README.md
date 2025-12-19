# SaaS/PaaS Security Pack (Multi-tenant, subscription, integrations)
This is a **drop-in security + ops kit** for building a SaaS/PaaS platform with:
- Multi-tenancy isolation (tenant context on every request)
- Subscription/billing hardening (webhook verification, plan gating)
- API keys + OAuth scopes + service accounts
- Per-tenant quotas and rate limits
- Admin/support access (JIT, impersonation with consent, audit trails)
- Data residency + export/import + deletion flows
- Uptime/SLOs, incident response, DR
- CI security gates + evidence folders (SOC2-ish)

**This pack is implementation templates + runnable snippets**, not a compliance certificate.

## Folder map
- `architecture/` tenancy, data flows, threat models, residency
- `app/` code templates (Next.js/Node) for tenant context, RBAC/ABAC, rate limits, plan gating
- `db/` Postgres schemas + RLS patterns for multi-tenancy
- `billing/` Stripe-style webhook verification + anti-tamper rules
- `integrations/` API key lifecycle, webhook security, marketplace vetting
- `ops/` admin/support JIT, impersonation logging, break-glass
- `observability/` SLOs, alerts, dashboards, status page basics
- `cicd/` security workflows + gates
- `policies/` policies + procedures
- `runbooks/` IR + breach + DR + customer comms
- `checklists/` go-live + enterprise readiness
- `evidence/` starter evidence collection structure

## Quick start (in a real repo)
1) Pick tenancy strategy: `db/schema-per-tenant`, `db/shared-db-tenant-id`, or `db/db-per-tenant`.
2) Implement tenant context middleware from `app/tenant/tenant-context.ts`.
3) Enforce *both*:
   - App-layer authz checks (RBAC/ABAC)
   - DB-layer RLS tenant policies (if using shared DB)
4) Add CI gates from `cicd/github-actions/`.
