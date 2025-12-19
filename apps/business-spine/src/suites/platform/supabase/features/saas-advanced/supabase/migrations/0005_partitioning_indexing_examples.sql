-- 0005_partitioning_indexing_examples.sql
-- Examples you can copy/paste for time-series tables.

-- Example event table partitioned by month
create table if not exists app.events (
  id uuid not null default gen_random_uuid(),
  tenant_id uuid not null,
  created_at timestamptz not null default now(),
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  primary key (id, created_at)
) partition by range (created_at);

-- Create one sample partition (you'll automate creation via cron/edge function)
create table if not exists app.events_2025_12
partition of app.events
for values from ('2025-12-01') to ('2026-01-01');

-- Indexing patterns
create index if not exists idx_events_tenant_time on app.events (tenant_id, created_at desc);
create index if not exists idx_events_kind on app.events (kind);
create index if not exists gin_events_payload on app.events using gin (payload);

alter table app.events enable row level security;

create policy events_select
on app.events for select
using (
  tenant_id = app.request_tenant_id()
  and app.is_tenant_member(tenant_id, app.request_user_id())
);
