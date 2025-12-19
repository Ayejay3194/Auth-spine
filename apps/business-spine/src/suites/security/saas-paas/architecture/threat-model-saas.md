# SaaS Threat Model (high-signal)

Top threats you must plan for:
- Cross-tenant data leak (SEV1)
- Auth bypass (stolen session/JWT, broken refresh)
- Privilege escalation (admin/support tools)
- Webhook forgery (billing, integrations)
- API key leak + abuse (rate limits, quotas)
- Export abuse (data exfiltration)
- Support impersonation abuse (no consent, no logs)
- Custom branding XSS (unsafe CSS/HTML)
- Cache poisoning across tenants

Core controls:
- tenant context validation middleware
- object-level authorization checks
- DB RLS (shared-db)
- signed webhooks + replay protection
- per-tenant rate limits/quotas
- audited admin actions + JIT access
