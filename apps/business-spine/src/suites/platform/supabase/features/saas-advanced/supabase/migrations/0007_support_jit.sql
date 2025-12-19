-- 0007_support_jit.sql
-- Support JIT access table + RPC. Designed for strict auditing.

create table if not exists app.support_access_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  support_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','active','revoked','expired')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  reason text,
  created_by uuid,
  approved_by uuid
);

create index if not exists idx_support_grants_tenant on app.support_access_grants (tenant_id, status);

alter table app.support_access_grants enable row level security;

-- Default: customers cannot see internal support grants unless you want them to.
-- If you DO, create a read-only view per tenant.

create or replace function app.support_jit(
  p_mode text,
  p_tenant_id uuid,
  p_support_user_id uuid,
  p_minutes int default 30
) returns jsonb
language plpgsql
security definer
set search_path = app, public
as $$
declare
  grant_id uuid;
begin
  if p_mode = 'request' then
    insert into app.support_access_grants(tenant_id, support_user_id, status, expires_at)
    values (p_tenant_id, p_support_user_id, 'requested', now() + make_interval(mins => p_minutes))
    returning id into grant_id;

    perform app.audit_write(p_tenant_id, null, 'support:request', 'support_access_grant', grant_id::text,
      jsonb_build_object('minutes', p_minutes), null, null);

    return jsonb_build_object('id', grant_id, 'status', 'requested');
  elsif p_mode = 'approve' then
    update app.support_access_grants
      set status='active', approved_at=now(), expires_at=now() + make_interval(mins => p_minutes)
      where tenant_id=p_tenant_id and support_user_id=p_support_user_id and status='requested'
      returning id into grant_id;

    perform app.audit_write(p_tenant_id, null, 'support:approve', 'support_access_grant', grant_id::text,
      jsonb_build_object('minutes', p_minutes), null, null);

    return jsonb_build_object('id', grant_id, 'status', 'active');
  elsif p_mode = 'revoke' then
    update app.support_access_grants
      set status='revoked', revoked_at=now()
      where tenant_id=p_tenant_id and support_user_id=p_support_user_id and status in ('requested','active')
      returning id into grant_id;

    perform app.audit_write(p_tenant_id, null, 'support:revoke', 'support_access_grant', grant_id::text,
      '{}'::jsonb, null, null);

    return jsonb_build_object('id', grant_id, 'status', 'revoked');
  else
    raise exception 'invalid mode';
  end if;
end;
$$;
