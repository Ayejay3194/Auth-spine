# Supabase Storage Policies (patterns)

Supabase Storage policies are implemented via Postgres RLS on `storage.objects`.

## Common patterns

### 1) User-scoped path
`bucket = 'avatars'` and `name like '{user_id}/%'`

### 2) Tenant-scoped path
`bucket = 'tenant-files'` and `name like '{tenant_id}/%'`

### 3) Signed URLs (recommended for private reads)
Generate signed URLs in an Edge Function using a service role key.

## Example policy SQL snippets
See `supabase/policies/storage_policies.sql`
