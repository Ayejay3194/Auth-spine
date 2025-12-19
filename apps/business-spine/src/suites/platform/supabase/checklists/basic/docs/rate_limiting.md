# Rate Limiting Notes (Supabase-first)

Supabase itself won’t magically prevent abuse on your public endpoints.
Do this:
- **Client API**: keep it thin, rely on RLS + restrictive queries.
- **Edge Functions**: implement per-IP + per-tenant rate limits.
- **Store counters** in Postgres (cheap) or Redis (faster).
- **Return 429** with backoff hints.

Included: `functions/webhook_receiver` template + place to add counters.
