# Multi-tenancy strategies (pick your poison)

## A) Shared DB + tenant_id column (most common)
Pros:
- simplest operations, lowest cost
- easy onboarding
Cons:
- requires flawless tenant scoping + RLS

Use:
- `tenant_id` on every table
- request must derive tenant context
- DB RLS enforces `tenant_id = current_setting('app.tenant_id')`

## B) Schema-per-tenant
Pros:
- stronger isolation
- easier “delete tenant”
Cons:
- more complex migrations, connection pooling, observability

## C) DB-per-tenant (enterprise / regulated)
Pros:
- strongest isolation, easier residency guarantees
Cons:
- expensive, provisioning complexity

## Rule of life
No matter which you choose:
- tenant context must be validated on every request
- cross-tenant access is a SEV1 incident
