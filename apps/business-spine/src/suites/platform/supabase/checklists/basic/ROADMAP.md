# Implementation Roadmap (Practical, not fantasy)

## Phase 0 (Day 0): Don’t leak data
- RLS default deny on every table
- tenant_id everywhere + JWT claim validation
- storage policies (no public buckets by accident)
- service-role key never shipped to clients

## Phase 1 (Week 1): MVP auth + core data
- Auth: email + OAuth, verification, password reset
- Base schema + migrations in repo
- Basic observability: logs + error alerts

## Phase 2 (Week 2-3): Multi-tenancy + billing gates
- tenant provisioning workflow
- plan gating (feature flags) + quota enforcement
- admin console permissions

## Phase 3: Realtime + Edge Functions
- Signed webhooks, background jobs, realtime features as needed

## Phase 4: Enterprise extras
- SAML/SCIM, BYOK, dedicated infra, long retention
