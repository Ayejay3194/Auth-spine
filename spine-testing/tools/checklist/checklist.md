Phase 1: Auth Spine
- [ ] Sign up with valid/invalid emails
- [ ] Login with correct/wrong credentials
- [ ] Password reset flow end-to-end
- [ ] Session persistence (refresh page, still logged in?)
- [ ] Logout clears session
- [ ] Protected routes block unauthorized access
- [ ] SQLi probe: admin'--
- [ ] XSS probe: <script>alert('xss')</script>
- [ ] Rate limiting: repeated failed logins blocked
- [ ] Token/session expiry + refresh
- [ ] RBAC works

Payments (Stripe)
- [ ] Create test subscription
- [ ] Success webhook updates DB
- [ ] Failure handled + no entitlements
- [ ] Cancel works
- [ ] Refund path
- [ ] Invoice generation
- [ ] Proration on plan changes

Multi-tenancy (Critical)
- [ ] Tenant A cannot see Tenant B data
- [ ] API calls scoped to tenant
- [ ] DB queries filter tenantId
- [ ] Team invites within tenant
- [ ] Workspace switching updates context

Integration Workflows
- [ ] Signup -> onboarding
- [ ] Upgrade -> unlock features
- [ ] Create content -> persists
- [ ] Invite team -> works
- [ ] Admin analytics correct
- [ ] Cancel -> downgrade gracefully

Error Scenarios
- [ ] API 500 -> friendly UI
- [ ] DB fails -> graceful mode
- [ ] Payment fails -> retry/dunning
- [ ] Session expires mid-action -> redirect with return URL

Load/Performance
- [ ] 100 concurrent signups
- [ ] 500 concurrent requests stable
- [ ] DB concurrent writes stable
- [ ] Cache helps performance
- [ ] Page loads <2s

Security
- [ ] /admin without role blocked
- [ ] IDOR blocked (cannot edit another user)
- [ ] Feature gating cannot be bypassed
- [ ] No secrets exposed
- [ ] HTTPS in prod
- [ ] CORS locked down

Deployment/DR
- [ ] Staging deploy works
- [ ] Migrations run
- [ ] Env vars load
- [ ] Health checks pass
- [ ] Logs visible
- [ ] Restore drill works
