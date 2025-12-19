-- 0006_quota_sweep_rpc.sql
-- Service-role callable quota enforcement.
create or replace function app.quota_sweep_projects()
returns jsonb
language plpgsql
security definer
set search_path = app, public
as $$
declare
  r record;
  affected int := 0;
begin
  for r in
    select q.tenant_id, q.max_projects, u.projects_count
    from app.tenant_quotas q
    join app.tenant_usage_counters u on u.tenant_id = q.tenant_id
    where u.projects_count > q.max_projects
  loop
    update app.tenants set status = 'suspended' where id = r.tenant_id and status = 'active';
    affected := affected + 1;
    perform app.audit_write(r.tenant_id, null, 'quota:suspend', 'tenant', r.tenant_id::text,
      jsonb_build_object('max_projects', r.max_projects, 'projects_count', r.projects_count),
      null, null);
  end loop;

  return jsonb_build_object('affected', affected);
end;
$$;
