-- Storage policies examples.
-- These assume you store files under: {tenant_id}/{...}

-- Enable RLS on storage.objects (should already be enabled in Supabase)
alter table storage.objects enable row level security;

-- Read: tenant members can read objects in their tenant prefix
create policy "tenant_read_objects"
on storage.objects for select
using (
  bucket_id = 'tenant-files'
  and (storage.objects.name like (app.request_tenant_id()::text || '/%'))
  and app.is_tenant_member(app.request_tenant_id(), app.request_user_id())
);

-- Write: tenant members can write within their tenant prefix
create policy "tenant_write_objects"
on storage.objects for insert
with check (
  bucket_id = 'tenant-files'
  and (storage.objects.name like (app.request_tenant_id()::text || '/%'))
  and app.is_tenant_member(app.request_tenant_id(), app.request_user_id())
);

-- Delete: admin/owner only
create policy "tenant_delete_objects_admin"
on storage.objects for delete
using (
  bucket_id = 'tenant-files'
  and (storage.objects.name like (app.request_tenant_id()::text || '/%'))
  and app.user_role_in_tenant(app.request_tenant_id(), app.request_user_id()) in ('owner','admin')
);
