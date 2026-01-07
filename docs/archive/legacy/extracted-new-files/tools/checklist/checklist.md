Phase 1: Auth Spine
- [ ] Sign up with valid/invalid emails
- [ ] Login with correct/wrong credentials
- [ ] Password reset flow end-to-end
- [ ] Session persistence
- [ ] Logout clears session
- [ ] Protected routes block unauthorized access
- [ ] SQLi probe: admin'--
- [ ] XSS probe: <script>alert('xss')</script>
- [ ] Rate limiting
- [ ] Token/session expiry + refresh
- [ ] RBAC works

Payments (Stripe)
- [ ] Subscription create/update webhook updates DB
- [ ] Cancel removes access gracefully
- [ ] Refund path logged

Multi-tenancy (Critical)
- [ ] Tenant A cannot see Tenant B data
- [ ] API scoped to tenant
- [ ] DB tenantId scoping

Load/Perf
- [ ] Concurrency stable

Security
- [ ] Admin endpoints blocked without role
- [ ] IDOR blocked
- [ ] No secrets leaked

DR/Deploy
- [ ] Migrations/seed ok
- [ ] Restore drill (manual) passes
