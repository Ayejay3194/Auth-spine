-- RLS policy test template.
-- You can adapt this to pgTAP (if you install it) or run ad-hoc checks.

-- 1) Create two tenants A/B, users u1/u2
-- 2) Add u1 to tenant A, u2 to tenant B
-- 3) Ensure u1 cannot select tenant B projects, etc.

-- NOTE: In Supabase, setting auth context in SQL tests is non-trivial.
-- Common approach: run tests via a harness that sets `request.jwt.claim.*` settings.

-- Example (pseudo):
-- select set_config('request.jwt.claim.sub', '<u1>', true);
-- select set_config('request.jwt.claim.tenant_id', '<tenantA>', true);
-- select * from app.projects; -- should only show tenantA projects
