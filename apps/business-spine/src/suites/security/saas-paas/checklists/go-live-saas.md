# SaaS Go-live checklist (blockers)
Tenancy:
- [ ] Tenant context enforced on every request
- [ ] Cache keys include tenant+role
- [ ] DB RLS enabled (shared-db)
- [ ] Cross-tenant detection alerts

Billing:
- [ ] Webhook signature verification + idempotency
- [ ] Server-side plan gating (no client trust)
- [ ] Refunds/credits restricted + audited

API:
- [ ] Per-tenant API keys + rotation
- [ ] Per-tenant rate limits + quotas
- [ ] Abuse detection + 429s

Support/Ops:
- [ ] MFA required
- [ ] JIT access
- [ ] Impersonation consent + logs

Data:
- [ ] Export endpoints rate-limited + logged
- [ ] Deletion/offboarding workflow tested
