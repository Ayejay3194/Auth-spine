-- 0004_api_keys_quotas.sql
-- API keys (hash-only), scopes, quotas, usage counters.

create table if not exists app.api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  name text not null,
  key_hash bytea not null, -- store digest(raw_key) only
  scopes text[] not null default '{}'::text[],
  status text not null default 'active' check (status in ('active','revoked')),
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists ux_api_keys_hash on app.api_keys (key_hash);

alter table app.api_keys enable row level security;

create policy api_keys_read
on app.api_keys for select
using (
  tenant_id = app.request_tenant_id()
  and app.user_role_in_tenant(tenant_id, app.request_user_id()) in ('owner','admin','billing')
);

create policy api_keys_write_admin
on app.api_keys for insert
with check (
  tenant_id = app.request_tenant_id()
  and app.user_role_in_tenant(tenant_id, app.request_user_id()) in ('owner','admin')
);

create policy api_keys_update_admin
on app.api_keys for update
using (
  tenant_id = app.request_tenant_id()
  and app.user_role_in_tenant(tenant_id, app.request_user_id()) in ('owner','admin')
);

-- Quotas
create table if not exists app.tenant_quotas (
  tenant_id uuid primary key references app.tenants(id) on delete cascade,
  plan text not null default 'free',
  max_projects int not null default 3,
  max_storage_mb int not null default 500,
  max_api_calls_per_min int not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.tenant_usage_counters (
  tenant_id uuid primary key references app.tenants(id) on delete cascade,
  projects_count int not null default 0,
  storage_mb int not null default 0,
  api_calls_rolling_min int not null default 0,
  api_calls_window_start timestamptz,
  updated_at timestamptz not null default now()
);

create trigger tg_quotas_updated_at
before update on app.tenant_quotas
for each row execute function app.tg_set_updated_at();

-- Simple project counter triggers
create or replace function app.tg_projects_counter()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    insert into app.tenant_usage_counters(tenant_id, projects_count)
    values (new.tenant_id, 1)
    on conflict (tenant_id) do update set
      projects_count = app.tenant_usage_counters.projects_count + 1,
      updated_at = now();
    return new;
  elsif (TG_OP = 'DELETE') then
    update app.tenant_usage_counters
      set projects_count = greatest(projects_count - 1, 0),
          updated_at = now()
      where tenant_id = old.tenant_id;
    return old;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists tg_projects_counter on app.projects;
create trigger tg_projects_counter
after insert or delete on app.projects
for each row execute function app.tg_projects_counter();
