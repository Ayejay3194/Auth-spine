-- Storage policy patterns (Supabase storage.objects)

-- Convention: bucket = 'private', user files stored at: {userId}/...

-- Allow authenticated users to read their own files
create policy if not exists "storage_read_own" on storage.objects
for select
to authenticated
using (
  bucket_id = 'private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to upload into their own folder
create policy if not exists "storage_write_own" on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow delete/updates for own
create policy if not exists "storage_modify_own" on storage.objects
for update
to authenticated
using (
  bucket_id = 'private'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy if not exists "storage_delete_own" on storage.objects
for delete
to authenticated
using (
  bucket_id = 'private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to upload into their own folder
create policy if not exists "storage_insert_own" on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow owners to update metadata on their own objects
create policy if not exists "storage_update_own" on storage.objects
for update
to authenticated
using (
  bucket_id = 'private'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow owners to delete their own objects
create policy if not exists "storage_delete_own" on storage.objects
for delete
to authenticated
using (
  bucket_id = 'private'
  and (storage.foldername(name))[1] = auth.uid()::text
);
orage.objects
for update
to authenticated
using (bucket_id = 'private' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'private' and (storage.foldername(name))[1] = auth.uid()::text);

create policy if not exists "storage_delete_own" on storage.objects
for delete
to authenticated
using (bucket_id = 'private' and (storage.foldername(name))[1] = auth.uid()::text);

-- Public read bucket example (e.g., avatars)
create policy if not exists "storage_public_read" on storage.objects
for select
to anon, authenticated
using (bucket_id = 'public');
))[1] = auth.uid()::text);

-- Public read bucket example: bucket = 'public'
create policy if not exists "storage_public_read" on storage.objects
for select
to anon, authenticated
using (bucket_id = 'public');
