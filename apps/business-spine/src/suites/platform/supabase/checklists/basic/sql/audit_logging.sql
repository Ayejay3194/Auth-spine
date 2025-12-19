-- AUDIT LOGGING TEMPLATE (DB-LEVEL)
create schema if not exists audit;

create table if not exists audit.events (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  tenant_id uuid,
  actor_user_id uuid,
  actor_role text,
  action text not null,
  table_name text,
  record_id text,
  diff jsonb,
  ip text,
  user_agent text
);

-- Generic trigger function
create or replace function audit.log_row_change()
returns trigger
language plpgsql
security definer
as $$
declare
  v_tenant uuid;
begin
  -- try common patterns
  v_tenant := coalesce(
    (to_jsonb(new)->>'tenant_id')::uuid,
    (to_jsonb(old)->>'tenant_id')::uuid
  );

  insert into audit.events(
    tenant_id, actor_user_id, actor_role, action, table_name, record_id, diff
  ) values (
    v_tenant,
    auth.uid(),
    current_setting('role', true),
    tg_op,
    tg_table_schema || '.' || tg_table_name,
    coalesce((to_jsonb(new)->>'id'), (to_jsonb(old)->>'id')),
    jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
  );

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

-- Example attach:
-- create trigger trg_audit_projects
-- after insert or update or delete on app.projects
-- for each row execute function audit.log_row_change();
