# StyleSeat-Level Platform


## PLUS Pack
- Waitlist + matching + gapfill slots
- Staff + commissions (rules + ledger)
- Loyalty points + tiers
- Referrals + gift cards
- MessageLog queue + basic delivery worker stubs
- Dash pages under /dashboard


## Production Hardening Pack
- JWT auth + middleware
- Redis cache + rate limiting
- BullMQ queues + worker
- Prometheus metrics + /api/metrics
- OpenAPI JSON + /api/openapi.json
- Sentry stubs
- docker-compose (Postgres + Redis)
- backup script
- unit test scaffolding (vitest)


## Enterprise Hardening Pack
- API keys (create/revoke) + hashed storage
- MFA (TOTP) start/confirm + recovery codes
- CSRF token endpoint (double-submit)
- Swagger UI page (/swagger-ui)
- Vault client helper + docs
- Helm chart scaffold + Terraform skeleton
- Vitest coverage script (npm run test:coverage)


## Full Enterprise Finish
- Password auth (argon2id) + DB sessions + logout
- CSRF endpoint + enforcement pattern docs
- Real webhook delivery with signing + retries (BullMQ worker)
- Real report export generation (CSV) + status endpoint
- Terraform (AWS) runnable skeleton
