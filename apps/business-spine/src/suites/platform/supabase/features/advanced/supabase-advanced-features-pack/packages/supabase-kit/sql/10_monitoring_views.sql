-- Database statistics & metrics

-- 1) Table sizes
create or replace view app_monitor_table_sizes as
select
  n.nspname as schema,
  c.relname as table,
  pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
  pg_total_relation_size(c.oid) as total_bytes,
  pg_size_pretty(pg_relation_size(c.oid)) as heap_size,
  pg_size_pretty(pg_indexes_size(c.oid)) as index_size,
  c.reltuples::bigint as approx_rows
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname not in ('pg_catalog','information_schema')
order by total_bytes desc;

-- 2) Index usage
create or replace view app_monitor_index_usage as
select
  schemaname as schema,
  relname as table,
  indexrelname as index,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
from pg_stat_user_indexes
order by idx_scan asc, pg_relation_size(indexrelid) desc;

-- 3) Long-running queries
create or replace view app_monitor_long_running_queries as
select
  pid,
  usename,
  application_name,
  client_addr,
  now() - query_start as runtime,
  state,
  wait_event_type,
  wait_event,
  left(query, 2000) as query
from pg_stat_activity
where state <> 'idle'
order by runtime desc;

-- 4) WAL + checkpoints (requires permissions; view exists anyway)
create or replace view app_monitor_wal as
select
  pg_current_wal_lsn() as current_lsn,
  pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') as bytes_since_start;
;

-- 2) Index usage (requires stats collector)
create or replace view app_monitor_index_usage as
select
  schemaname as schema,
  relname as table,
  indexrelname as index,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
from pg_stat_user_indexes
order by idx_scan asc;

-- 3) Missing / unused indexes signal (heuristic)
create or replace view app_monitor_unused_indexes as
select
  schemaname as schema,
  relname as table,
  indexrelname as index,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan
from pg_stat_user_indexes
where idx_scan = 0
  and indexrelname not like '%pkey%'
order by pg_relation_size(indexrelid) desc;

-- 4) Connection pool snapshot
create or replace view app_monitor_connections as
select
  datname as database,
  usename as user,
  client_addr,
  state,
  count(*) as connections
from pg_stat_activity
where datname = current_database()
group by datname, usename, client_addr, state
order by connections desc;

-- 5) Long-running queries (threshold: 30s)
create or replace view app_monitor_long_running_queries as
select
  pid,
  usename,
  now() - query_start as runtime,
  state,
  wait_event_type,
  wait_event,
  left(query, 500) as query
from pg_stat_activity
where state <> 'idle'
  and query_start is not null
  and now() - query_start > interval '30 seconds'
order by runtime desc;

-- 6) WAL / checkpoint-ish stats (supabase may restrict some views on shared plans)
create or replace view app_monitor_bgwriter as
select * from pg_stat_bgwriter;
;

-- 4) Long-running queries (requires privileges)
create or replace view app_monitor_long_running_queries as
select
  pid,
  usename,
  state,
  now() - query_start as runtime,
  left(query, 500) as query
from pg_stat_activity
where state <> 'idle'
  and query_start is not null
order by runtime desc;

-- 5) Connection pool snapshot
create or replace view app_monitor_connections as
select
  state,
  count(*) as connections
from pg_stat_activity
group by state
order by connections desc;

-- 6) WAL basics (approx)
create or replace view app_monitor_wal as
select
  pg_current_wal_lsn() as current_lsn,
  pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') as bytes_since_origin;

-- 6) WAL/checkpoints (depends on permissions)
create or replace view app_monitor_bgwriter as
select
  checkpoints_timed,
  checkpoints_req,
  checkpoint_write_time,
  checkpoint_sync_time,
  buffers_checkpoint,
  buffers_clean,
  maxwritten_clean,
  buffers_backend,
  buffers_alloc
from pg_stat_bgwriter;

-- 6) Connection snapshot
create or replace view app_monitor_connections as
select
  datname,
  count(*) filter (where state = 'active') as active,
  count(*) filter (where state = 'idle') as idle,
  count(*) filter (where state = 'idle in transaction') as idle_in_tx,
  count(*) as total
from pg_stat_activity
where datname = current_database()
group by datname;
