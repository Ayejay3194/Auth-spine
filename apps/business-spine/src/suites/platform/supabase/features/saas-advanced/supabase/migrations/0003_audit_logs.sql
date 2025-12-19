-- 0003_audit_logs.sql
-- Audit logging with tamper-evident chaining.

create table if not exists app.audit_log (
  id bigserial primary key,
  tenant_id uuid,
  actor_user_id uuid,
  action text not null,
  entity_type text,
  entity_id text,
  request_id uuid default gen_random_uuid(),
  ip inet,
  user_agent text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  prev_hash bytea,
  this_hash bytea
);

create index if not exists idx_audit_tenant_time on app.audit_log (tenant_id, created_at desc);
create index if not exists idx_audit_actor_time on app.audit_log (actor_user_id, created_at desc);

alter table app.audit_log enable row level security;

-- Only tenant members can read tenant audit logs; write via SECURITY DEFINER function.
create policy audit_read
on app.audit_log for select
using (
  tenant_id is null
  or (tenant_id = app.request_tenant_id() and app.is_tenant_member(tenant_id, app.request_user_id()))
);

create or replace function app.audit_write(
  p_tenant_id uuid,
  p_actor uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_payload jsonb,
  p_ip inet,
  p_user_agent text
) returns void
language plpgsql
security definer
set search_path = app, public
as $$
declare
  last_hash bytea;
  new_hash bytea;
  concat_bytes bytea;
begin
  select this_hash into last_hash
  from app.audit_log
  where tenant_id is not distinct from p_tenant_id
  order by id desc
  limit 1;

  concat_bytes := convert_to(
    coalesce(encode(last_hash,'hex'),'') || '|' ||
    coalesce(p_tenant_id::text,'') || '|' ||
    coalesce(p_actor::text,'') || '|' ||
    coalesce(p_action,'') || '|' ||
    coalesce(p_entity_type,'') || '|' ||
    coalesce(p_entity_id,'') || '|' ||
    coalesce(p_payload::text,'') || '|' ||
    now()::text,
    'utf8'
  );

  new_hash := digest(concat_bytes, 'sha256');

  insert into app.audit_log(
    tenant_id, actor_user_id, action, entity_type, entity_id,
    ip, user_agent, payload, prev_hash, this_hash
  ) values (
    p_tenant_id, p_actor, p_action, p_entity_type, p_entity_id,
    p_ip, p_user_agent, coalesce(p_payload,'{}'::jsonb),
    last_hash, new_hash
  );
end;
$$;

-- Example trigger hook: audit project changes
create or replace function app.tg_audit_projects()
returns trigger
language plpgsql
as $$
declare
  tid uuid;
  uid uuid;
begin
  tid := coalesce(new.tenant_id, old.tenant_id);
  uid := app.request_user_id();

  perform app.audit_write(
    tid,
    uid,
    TG_OP || ':projects',
    'projects',
    coalesce(new.id, old.id)::text,
    jsonb_build_object('new', to_jsonb(new), 'old', to_jsonb(old)),
    null,
    null
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists tg_projects_audit on app.projects;
create trigger tg_projects_audit
after insert or update or delete on app.projects
for each row execute function app.tg_audit_projects();
