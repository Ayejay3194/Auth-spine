-- Shared DB with tenant_id (baseline)
create extension if not exists pgcrypto;

create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  region text not null default 'US',
  plan text not null default 'FREE',
  status text not null default 'ACTIVE', -- ACTIVE | SUSPENDED | DELETED
  created_at timestamptz default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  role text not null, -- OWNER, ADMIN, MEMBER, SUPPORT (support is platform-side)
  created_at timestamptz default now(),
  unique (tenant_id, email)
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  key_hash text not null,
  scopes text[] not null default '{}',
  status text not null default 'ACTIVE',
  created_at timestamptz default now(),
  last_used_at timestamptz
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete set null,
  actor_user_id uuid,
  actor_type text not null, -- USER | SERVICE | SUPPORT
  action text not null,
  entity_type text not null,
  entity_id text not null,
  ip text,
  user_agent text,
  before jsonb,
  after jsonb,
  created_at timestamptz default now()
);

create index on audit_logs (tenant_id, created_at desc);
