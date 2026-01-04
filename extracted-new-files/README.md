Spine Testing Suite (Self-Seeding)
=================================

This suite creates its own test tenants/users/roles before running tests, so you don't have to manually seed anything.

Works best with the build-once-core package layout:
- Prisma schema includes Tenant/User/Role/UserRole/Session/Subscription/AuditLog/UsageMeter
- API endpoints include:
  - GET /health
  - POST /tenants (dev ok)
  - POST /auth/login (or replace in config)
  - GET /auth/sessions

If your auth differs, set AUTH_MODE in tools/config.ts:
- "api_login" (default) uses /auth/login
- "direct_session" creates sessions directly via @suite/sessions (bypasses API auth; useful when API auth is different)

Run:
  npm i
  npm run seed
  npm run test:api
  npm run test:e2e
  BASE_URL=http://localhost:3001 npm run test:load
  npm run security:audit
  npm run cleanup   # optional

Env:
  BASE_URL (default http://localhost:3001)
  DATABASE_URL (needed for Prisma seed/cleanup)
