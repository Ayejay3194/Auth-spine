# Postgres setup (v5)

## 1) Create DB
Create a postgres database however you like.

## 2) Apply schema
Run the SQL in:
- `packages/storage-postgres/sql/schema.sql`

Example:
```bash
psql "$DATABASE_URL" -f packages/storage-postgres/sql/schema.sql
```

## 3) Env
Set:
- DATABASE_URL=postgres://...
- TENANT_ID_DEFAULT=public (optional)
