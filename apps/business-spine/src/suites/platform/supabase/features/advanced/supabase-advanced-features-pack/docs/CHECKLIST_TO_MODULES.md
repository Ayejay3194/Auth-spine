# Checklist → Modules Map

You dumped an entire database encyclopedia into chat. Respectfully: here's where it lives.

## Database administration & metrics
- Table size monitoring → `sql/10_monitoring_views.sql` (`app_monitor_table_sizes`)
- Index usage statistics → `sql/10_monitoring_views.sql` (`app_monitor_index_usage`, `app_monitor_unused_indexes`)
- Connection pool stats → `sql/10_monitoring_views.sql` (`app_monitor_connections`)
- Long-running queries → `sql/10_monitoring_views.sql` (`app_monitor_long_running_queries`)

## Advanced query features
- Fuzzy matching / trigram → `sql/00_extensions.sql` (`pg_trgm`), `sql/50_search.sql`
- Levenshtein / Soundex → `sql/00_extensions.sql` (`fuzzystrmatch`), `sql/50_search.sql`
- JSONB aggregation / operators → use Postgres native, index with `GIN` as needed

## Auth hardening & sessions
- Concurrent sessions, device tracking, revoke session → `sql/40_auth_sessions.sql`
- Audit trail (append-only) → `sql/20_security_audit.sql`, `src/audit.ts`
- Rate limiting via DB bucket → `sql/20_security_audit.sql` (`app_rate_limit_hit`), `src/rateLimit.ts`, `edge-functions/_shared/rateLimit.ts`

## Storage
- User-scoped private buckets → `sql/30_storage_policies.sql`

## Realtime
- Presence/broadcast wrappers → `src/realtime.ts`

## Edge functions
- Middleware chain → `edge-functions/_shared/middleware.ts`
- Auth gate + role gate → `edge-functions/_shared/auth.ts`
- Example protected metrics endpoint → `edge-functions/metrics/index.ts`

## What’s intentionally *not* fully pre-baked
- Partitioning strategy (depends on your tables + data shape)
- PostGIS geometry types (depends on plan and whether you need geospatial)
- Bloat estimation (needs extensions/permissions, varies by environment)
- CRDT/OT collaboration engine (that’s a whole project, not a checklist item)
