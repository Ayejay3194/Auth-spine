-- Append-only audit log
create table if not exists audit_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_user_id uuid,
  actor_role text,
  action text not null,
  entity text,
  entity_id text,
  ip inet,
  user_agent text,
  metadata jsonb not null default '{}'
);

create index if not exists audit_log_created_at_idx on audit_log (created_at desc);
create index if not exists audit_log_actor_idx on audit_log (actor_user_id, created_at desc);

-- Make audit_log immutable in normal usage: block UPDATE/DELETE
create or replace function audit_log_immutable() returns trigger as $$
begin
  raise exception 'audit_log is append-only';
end;
$$ language plpgsql;

drop trigger if exists t_audit_log_immutable on audit_log;
create trigger t_audit_log_immutable
before update or delete on audit_log
for each row execute function audit_log_immutable();

-- Rate limit buckets (bucket = floor(now/window))
create table if not exists app_rate_limits (
  key text not null,
  bucket bigint not null,
  hits integer not null default 0,
  reset_at timestamptz not null,
  primary key (key, bucket)
);

-- Helper RPC for atomic rate limiting
create or replace function rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns table(ok boolean, remaining integer, reset_at timestamptz)
language plpgsql
as $$
declare
  b bigint;
  r timestamptz;
  new_hits integer;
begin
  b := floor(extract(epoch from now()) / p_window_seconds);
  r := to_timestamp((b + 1) * p_window_seconds);

  insert into app_rate_limits(key, bucket, hits, reset_at)
  values (p_key, b, 1, r)
  on conflict (key, bucket)
  do update set hits = app_rate_limits.hits + 1
  returning hits into new_hits;

  ok := (new_hits <= p_limit);
  remaining := greatest(p_limit - new_hits, 0);
  reset_at := r;
  return next;
end;
$$;

alter table audit_log enable row level security;

-- Only service role inserts in production. For local/dev you can relax this.
create policy "audit_log_insert_service" on audit_log
for insert
to authenticated
with check (false);

create policy "audit_log_select_self" on audit_log
for select
to authenticated
using (actor_user_id = auth.uid());

-- Simple postgres-backed rate limit bucket
create table if not exists app_rate_limit (
  key text not null,
  bucket timestamptz not null,
  count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (key, bucket)
);

-- Helpful composite index for cleanup queries
create index if not exists app_rate_limit_bucket_idx on app_rate_limit(bucket);

create table if not exists app_rate_limits (
  key text not null,
  bucket bigint not null,
  count integer not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (key, bucket)
);

create index if not exists app_rate_limits_reset_at_idx on app_rate_limits(reset_at);

alter table app_rate_limits enable row level security;

-- In practice you hit this from Edge Functions using service role.
create policy "rate_limits_no_client_access" on app_rate_limits
for all to authenticated
using (false) with check (false);
 level security;

create policy "ratelimit_service_only" on app_rate_limits
for all
to authenticated
using (false)
with check (false);

-- Atomic hit via RPC so you don't race in client code.
create or replace function app_rate_limit_hit(p_key text, p_limit int, p_window_seconds int)
returns table(ok boolean, remaining int, reset_at timestamptz)
language plpgsql
security definer
as $$
declare
  b bigint;
  r timestamptz;
  c int;
begin
  b := floor(extract(epoch from now()) / p_window_seconds);
  r := to_timestamp((b + 1) * p_window_seconds);

  insert into app_rate_limits(key, bucket, count, reset_at)
  values (p_key, b, 1, r)
  on conflict (key, bucket)
  do update set count = app_rate_limits.count + 1, updated_at = now()
  returning app_rate_limits.count into c;

  ok := c <= p_limit;
  remaining := greatest(p_limit - c, 0);
  reset_at := r;
  return next;
end;
$$;

revoke all on function app_rate_limit_hit(text, int, int) from public;
-- Grant execute to service role via Supabase dashboard, or manually:
-- grant execute on function app_rate_limit_hit(text, int, int) to service_role;
curity definer
as $$
declare
  v_now timestamptz := now();
  v_bucket bigint := floor(extract(epoch from v_now) / p_window_seconds);
  v_reset timestamptz := to_timestamp((v_bucket + 1) * p_window_seconds);
  v_count int;
begin
  insert into app_rate_limits(key, bucket, count, reset_at)
  values (p_key, v_bucket, 1, v_reset)
  on conflict (key, bucket) do update
    set count = app_rate_limits.count + 1,
        reset_at = excluded.reset_at,
        updated_at = v_now;

  select count into v_count from app_rate_limits where key = p_key and bucket = v_bucket;

  ok := (v_count <= p_limit);
  remaining := greatest(p_limit - v_count, 0);
  reset_at := v_reset;
  return next;
end;
$$;

revoke all on function app_rate_limit_hit(text, int, int) from public;
-- grant to service role via dashboard, or in SQL if you manage roles.
    set count = app_rate_limits.count + 1,
        updated_at = v_now,
        reset_at = v_reset
  returning count into v_count;

  ok := (v_count <= p_limit);
  remaining := greatest(p_limit - v_count, 0);
  reset_at := v_reset;
  return next;
end;
$$;

revoke all on function app_rate_limit_hit(text,int,int) from public;
grant execute on function app_rate_limit_hit(text,int,int) to service_role;
t(text,int,int) to anon, authenticated;
