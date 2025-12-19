-- 0001_tenant_core.sql
-- Core multi-tenant primitives: tenants, memberships, helpers.

create schema if not exists app;

-- Extensions commonly used (availability depends on Supabase plan/project config)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Tenants
create table if not exists app.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9][a-z0-9-]{2,62}$'),
  name text not null,
  status text not null default 'active' check (status in ('active','suspended','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Memberships
create table if not exists app.tenant_memberships (
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','billing','support')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

-- Tenant context helper
-- Preferred: put tenant_id in JWT claims (app_metadata or custom claims).
-- For local/dev you can fall back to request header `x-tenant-id` (NOT for prod).
create or replace function app.request_tenant_id()
returns uuid
language plpgsql
stable
as $$
declare
  tid uuid;
begin
  -- Try JWT claims
  begin
    tid := nullif(current_setting('request.jwt.claim.tenant_id', true), '')::uuid;
    if tid is not null then
      return tid;
    end if;
  exception when others then
    -- ignore
  end;

  -- DEV fallback: header
  begin
    tid := nullif(current_setting('request.headers', true)::json->>'x-tenant-id','')::uuid;
    return tid;
  exception when others then
    return null;
  end;
end;
$$;

create or replace function app.request_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function app.is_tenant_member(p_tenant uuid, p_user uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from app.tenant_memberships m
    where m.tenant_id = p_tenant and m.user_id = p_user
  );
$$;

create or replace function app.user_role_in_tenant(p_tenant uuid, p_user uuid)
returns text
language sql
stable
as $$
  select m.role
  from app.tenant_memberships m
  where m.tenant_id = p_tenant and m.user_id = p_user
  limit 1;
$$;

-- updated_at trigger
create or replace function app.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger tg_tenants_updated_at
before update on app.tenants
for each row execute function app.tg_set_updated_at();

create trigger tg_memberships_updated_at
before update on app.tenant_memberships
for each row execute function app.tg_set_updated_at();

-- Example tenant-scoped table
create table if not exists app.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_tenant on app.projects (tenant_id);

create trigger tg_projects_updated_at
before update on app.projects
for each row execute function app.tg_set_updated_at();
