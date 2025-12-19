-- Core quality-of-life extensions for the checklist items
create extension if not exists pg_stat_statements;
create extension if not exists pg_trgm;
create extension if not exists fuzzystrmatch;
create extension if not exists citext;
create extension if not exists "uuid-ossp";
-- PostGIS must be enabled in Supabase dashboard if plan supports it:
-- create extension if not exists postgis;
