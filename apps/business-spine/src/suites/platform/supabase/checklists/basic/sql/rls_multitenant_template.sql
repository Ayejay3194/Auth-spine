-- RLS MULTI-TENANT TEMPLATE
-- Assumes:
--   - every table has tenant_id uuid not null
--   - JWT contains tenant_id claim: auth.jwt() ->> 'tenant_id'
--   - roles: authenticated, anon, service_role

-- Helper: get tenant_id from JWT
create or replace function app.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'tenant_id','')::uuid
$$;

-- Example table
-- create table app.projects (
--   id uuid primary key default gen_random_uuid(),
--   tenant_id uuid not null,
--   owner_id uuid not null references auth.users(id),
--   name text not null,
--   created_at timestamptz not null default now()
-- );

alter table app.projects enable row level security;

-- Default deny (no policies = deny). Then add explicit allow:
create policy "tenant_select"
on app.projects for select
to authenticated
using (tenant_id = app.current_tenant_id());

create policy "tenant_insert"
on app.projects for insert
to authenticated
with check (tenant_id = app.current_tenant_id());

create policy "tenant_update"
on app.projects for update
to authenticated
using (tenant_id = app.current_tenant_id())
with check (tenant_id = app.current_tenant_id());

create policy "tenant_delete"
on app.projects for delete
to authenticated
using (tenant_id = app.current_tenant_id());

-- Admin bypass pattern (only if you implement admin claim)
-- using ( (auth.jwt()->>'is_admin')::boolean = true OR tenant_id = app.current_tenant_id() );
