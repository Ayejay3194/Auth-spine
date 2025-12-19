-- 0002_rls_policies.sql
-- RLS policies enforcing tenant isolation and membership.

alter table app.tenants enable row level security;
alter table app.tenant_memberships enable row level security;
alter table app.projects enable row level security;

-- Tenants: you can only see tenants you belong to
create policy tenants_select_members
on app.tenants for select
using (
  exists (
    select 1 from app.tenant_memberships m
    where m.tenant_id = app.tenants.id
      and m.user_id = app.request_user_id()
  )
);

-- Tenants: only owners/admin can update
create policy tenants_update_admin
on app.tenants for update
using (
  app.user_role_in_tenant(app.tenants.id, app.request_user_id()) in ('owner','admin')
);

-- Memberships: members can see membership rows for their tenant
create policy memberships_select
on app.tenant_memberships for select
using (
  app.is_tenant_member(app.tenant_memberships.tenant_id, app.request_user_id())
);

-- Memberships: only owner/admin can change roles or invite/remove
create policy memberships_write_admin
on app.tenant_memberships for insert
with check (
  app.user_role_in_tenant(app.tenant_memberships.tenant_id, app.request_user_id()) in ('owner','admin')
);

create policy memberships_update_admin
on app.tenant_memberships for update
using (
  app.user_role_in_tenant(app.tenant_memberships.tenant_id, app.request_user_id()) in ('owner','admin')
);

create policy memberships_delete_admin
on app.tenant_memberships for delete
using (
  app.user_role_in_tenant(app.tenant_memberships.tenant_id, app.request_user_id()) in ('owner','admin')
);

-- Projects: strictly tenant-scoped via tenant_id + membership
create policy projects_select
on app.projects for select
using (
  app.projects.tenant_id = app.request_tenant_id()
  and app.is_tenant_member(app.projects.tenant_id, app.request_user_id())
);

create policy projects_insert
on app.projects for insert
with check (
  app.projects.tenant_id = app.request_tenant_id()
  and app.is_tenant_member(app.projects.tenant_id, app.request_user_id())
);

create policy projects_update
on app.projects for update
using (
  app.projects.tenant_id = app.request_tenant_id()
  and app.is_tenant_member(app.projects.tenant_id, app.request_user_id())
);

create policy projects_delete
on app.projects for delete
using (
  app.projects.tenant_id = app.request_tenant_id()
  and app.user_role_in_tenant(app.projects.tenant_id, app.request_user_id()) in ('owner','admin')
);
