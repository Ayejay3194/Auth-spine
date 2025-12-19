# Checklist mapping: what Supabase gives you vs what you implement

This is the part humans skip, then act surprised.

## Supabase gives you (mostly out of the box)
- Postgres features: constraints, indexes, JSONB, CTEs, window functions, etc.
- Row Level Security (RLS)
- Auth (email, OAuth providers, magic links, phone depending on config)
- Storage (buckets + policies)
- Realtime (Postgres changes / broadcast / presence)
- Edge Functions (Deno)
- Metrics/logs in dashboard (varies by plan)

## You implement
- Multi-tenant isolation patterns (claims + RLS + defensive app code)
- Quotas & per-tenant limits (tables + triggers + enforcement jobs)
- API key scopes, rotation, rate limiting
- Webhook verification + replay protection
- Audit logs (tamper-evident optional)
- Support JIT access workflows
- Data residency options (architecture level; Supabase region choice helps but enterprise needs more)
- Advanced monitoring/alerting (ship logs/metrics to your stack)

See `supabase/migrations/*` and `supabase/functions/*`.
