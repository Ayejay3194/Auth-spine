create table if not exists app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ip inet,
  user_agent text,
  device_label text,
  is_revoked boolean not null default false
);

create index if not exists app_sessions_user_id_idx on app_sessions(user_id);
create index if not exists app_sessions_expires_at_idx on app_sessions(expires_at);

alter table app_sessions enable row level security;

create policy "session_select_self" on app_sessions
for select to authenticated
using (user_id = auth.uid());

create policy "session_revoke_self" on app_sessions
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- "Trusted devices" store a fingerprint hash (not raw fingerprint)
create table if not exists trusted_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  fingerprint_hash text not null,
  label text,
  unique (user_id, fingerprint_hash)
);

alter table trusted_devices enable row level security;
create policy "trusted_select_self" on trusted_devices for select to authenticated using (user_id = auth.uid());
create policy "trusted_write_self" on trusted_devices for insert to authenticated with check (user_id = auth.uid());
create policy "trusted_update_self" on trusted_devices for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "trusted_delete_self" on trusted_devices for delete to authenticated using (user_id = auth.uid());
