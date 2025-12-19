# Tenant Context: mandatory on every request

## Sources of truth (prefer deterministic)
1) Subdomain / custom domain: `tenantA.app.com` or `brand.com` mapped to tenant
2) Signed tenant token (server-issued)
3) Explicit header for service-to-service calls: `x-tenant-id` (only from trusted network)

## What not to do
- Let clients send `tenant_id` in the body and trust it.
- Infer tenant from user email domain without verification.
- Cache responses without tenant in cache key.

## Required validations
- Tenant exists + not suspended
- User belongs to tenant (or is service account scoped to tenant)
- Plan/feature flags checked for tenant
