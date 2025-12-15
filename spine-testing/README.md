Spine Testing Suite (Auth + Payments + Multi-Tenancy + Load + Security)
======================================================================

This suite plugs into your repo to execute the exact testing phases you listed:
- Human checklist (printable)
- Automated API tests (Vitest)
- E2E tests (Playwright)
- Load tests (k6)
- Security audits (npm audit + secret scan)

Set BASE_URL to your running API (default http://localhost:3001).

Run:
- npm i
- npm run checklist
- npm run test:api
- npm run test:e2e
- BASE_URL=http://localhost:3001 npm run test:load
- npm run security:audit

If your endpoints differ, update tools/config.ts.
