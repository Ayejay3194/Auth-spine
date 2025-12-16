LAUNCH GATE CHECKLIST
=====================

If any RED items are incomplete, do not ship.

AUTH & ACCESS (RED)
- [ ] Admin panel requires MFA or extra auth (at least for owners)
- [ ] RBAC enforced on API routes (not just UI)
- [ ] Audit log records sensitive actions (role changes, exports, refunds, payroll, feature flags)
- [ ] Secrets are not in repo; env vars validated at boot

MONEY (RED)
- [ ] Payment webhooks verified + idempotent
- [ ] Refund flow tested
- [ ] Reconciliation report exists (payments vs ledger)
- [ ] “Fake money mode” exists for staging

DATA (RED)
- [ ] Automated backups running
- [ ] Restore drill performed
- [ ] Export works (accountant packet)
- [ ] Data retention policy documented

OPS (RED)
- [ ] Health endpoint works
- [ ] Admin alerting works (critical alerts bypass mute)
- [ ] Kill switches tested (pause bookings/payments/payroll; lock admin writes)
- [ ] Rollback plan documented

QUALITY (YELLOW)
- [ ] E2E tests for top 3 flows
- [ ] Performance budget defined
- [ ] Accessibility pass for critical screens

If you pass: ship.
If you fail: fix first, ship later.
