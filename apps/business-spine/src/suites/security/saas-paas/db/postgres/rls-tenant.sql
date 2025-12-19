-- RLS tenant enforcement for shared DB
-- Pattern: set app.tenant_id at connection/session and require it.
-- In app code: `select set_config('app.tenant_id', '<tenant_uuid>', true);`

-- Example table
create table projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

alter table projects enable row level security;

-- Deny by default
revoke all on projects from public;

-- Allow select only within tenant
create policy tenant_select on projects
for select
using (tenant_id = current_setting('app.tenant_id')::uuid);

-- Allow insert only within tenant
create policy tenant_insert on projects
for insert
with check (tenant_id = current_setting('app.tenant_id')::uuid);

-- Same for update/delete
create policy tenant_update on projects
for update
using (tenant_id = current_setting('app.tenant_id')::uuid)
with check (tenant_id = current_setting('app.tenant_id')::uuid);

create policy tenant_delete on projects
for delete
using (tenant_id = current_setting('app.tenant_id')::uuid);
