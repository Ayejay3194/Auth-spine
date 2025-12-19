-- STORAGE POLICY EXAMPLE (PRIVATE BUCKET PER TENANT FOLDER)
-- Assumes objects are stored under: {tenant_id}/...
-- and you’re using storage.objects table policies

-- Enable RLS on storage.objects is handled by Supabase, you add policies.

-- Read: only same tenant
create policy "tenant_can_read_objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'private'
  and split_part(name, '/', 1)::uuid = app.current_tenant_id()
);

-- Write: only within tenant prefix
create policy "tenant_can_write_objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'private'
  and split_part(name, '/', 1)::uuid = app.current_tenant_id()
);
