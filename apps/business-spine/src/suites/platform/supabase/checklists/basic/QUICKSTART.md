# Quickstart

1) Copy this folder into your repo (or your shared “spine”).
2) Wire SQL:
- apply `sql/rls_multitenant_template.sql` patterns to your tables
- add audit triggers where you care
3) Add Edge Functions:
- deploy `functions/webhook_receiver` and set `WEBHOOK_SECRET`
4) Use `catalog/supabase_features_catalog.json` as your tracking source.

This pack is intentionally opinionated: **RLS + tenant isolation first**.
