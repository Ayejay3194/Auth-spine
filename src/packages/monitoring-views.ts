/**
 * Monitoring Views for Supabase Advanced Features Pack
 * 
 * Provides database monitoring views, performance metrics,
 * and administrative utilities for Supabase.
 */

import { DatabaseMetrics } from './types.js';

export class MonitoringViewsManager {
  private supabaseClient: any;
  private views: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize monitoring views
   */
  async initialize(supabaseClient: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    await this.loadViews();
    this.initialized = true;
  }

  /**
   * Get database metrics
   */
  async getMetrics(): Promise<DatabaseMetrics> {
    if (!this.initialized) {
      throw new Error('Monitoring views not initialized');
    }

    const connections = await this.getConnectionMetrics();
    const performance = await this.getPerformanceMetrics();
    const storage = await this.getStorageMetrics();
    const users = await this.getUserMetrics();

    return {
      connections,
      performance,
      storage,
      users
    };
  }

  /**
   * Get slow queries
   */
  async getSlowQueries(limit: number = 10): Promise<Array<{
    query: string;
    calls: number;
    total_time: number;
    mean_time: number;
    rows: number;
  }>> {
    const sql = `
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements
      WHERE mean_time > 1000 -- Queries taking more than 1 second
      ORDER BY mean_time DESC
      LIMIT $1;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql, params: [limit] });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get slow queries:', error);
      return [];
    }
  }

  /**
   * Get table statistics
   */
  async getTableStats(tableName?: string): Promise<Array<{
    tableName: string;
    rowCount: number;
    size: string;
    indexSize: string;
    lastVacuum: Date;
    lastAnalyze: Date;
    bloatRatio: number;
  }>> {
    let whereClause = '';
    const params: any[] = [];

    if (tableName) {
      whereClause = 'AND tablename = $1';
      params.push(tableName);
    }

    const sql = `
      SELECT 
        schemaname || '.' || tablename as "tableName",
        n_tup_ins + n_tup_upd + n_tup_del as "rowCount",
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "size",
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as "indexSize",
        last_vacuum as "lastVacuum",
        last_analyze as "lastAnalyze",
        0 as "bloatRatio" -- Would need additional calculation
      FROM pg_stat_user_tables
      WHERE 1=1 ${whereClause}
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql, params });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get table stats:', error);
      return [];
    }
  }

  /**
   * Get index usage
   */
  async getIndexUsage(): Promise<Array<{
    tableName: string;
    indexName: string;
    indexType: string;
    usageCount: number;
    size: string;
    unique: boolean;
  }>> {
    const sql = `
      SELECT 
        schemaname || '.' || tablename as "tableName",
        indexrelname as "indexName",
        CASE 
          WHEN indisunique THEN 'UNIQUE'
          WHEN indisprimary THEN 'PRIMARY KEY'
          ELSE 'INDEX'
        END as "indexType",
        idx_scan as "usageCount",
        pg_size_pretty(pg_relation_size(indexrelid)) as "size",
        indisunique as "unique"
      FROM pg_stat_user_indexes
      ORDER BY idx_scan DESC;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get index usage:', error);
      return [];
    }
  }

  /**
   * Get lock information
   */
  async getLocks(): Promise<Array<{
    lockType: string;
    database: string;
    relation: string;
    page: number;
    tuple: number;
    virtualTransaction: string;
    transactionId: number;
    classId: number;
    objectId: number;
    objectSubId: number;
    virtualTransactionId: string;
    mode: string;
    granted: boolean;
    fastPath: boolean;
  }>> {
    const sql = `
      SELECT 
        locktype as "lockType",
        database as "database",
        relation as "relation",
        page as "page",
        tuple as "tuple",
        virtualxid as "virtualTransaction",
        transactionid as "transactionId",
        classid as "classId",
        objid as "objectId",
        objsubid as "objectSubId",
        virtualtransaction as "virtualTransactionId",
        mode as "mode",
        granted as "granted",
        fastpath as "fastPath"
      FROM pg_locks
      ORDER BY NOT granted DESC, mode;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get locks:', error);
      return [];
    }
  }

  /**
   * Get active connections
   */
  async getActiveConnections(): Promise<Array<{
    pid: number;
    database: string;
    user: string;
    application: string;
    clientAddress: string;
    backendStart: Date;
    queryStart: Date;
    stateChange: Date;
    state: string;
    query: string;
  }>> {
    const sql = `
      SELECT 
        pid,
        datname as "database",
        usename as "user",
        application_name as "application",
        client_addr as "clientAddress",
        backend_start as "backendStart",
        query_start as "queryStart",
        state_change as "stateChange",
        state,
        query
      FROM pg_stat_activity
      WHERE state != 'idle'
      ORDER BY query_start;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get active connections:', error);
      return [];
    }
  }

  /**
   * Get replication lag
   */
  async getReplicationLag(): Promise<{
    lagSeconds: number;
    lagBytes: number;
    status: string;
  }> {
    const sql = `
      SELECT 
        EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) as "lagSeconds",
        pg_wal_lsn_diff(pg_current_wal_lsn(), pg_last_wal_replay_lsn()) as "lagBytes",
        CASE 
          WHEN pg_is_in_recovery() THEN 'standby'
          ELSE 'primary'
        END as "status";
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql });
      if (error) throw error;
      return data?.[0] || { lagSeconds: 0, lagBytes: 0, status: 'unknown' };
    } catch (error) {
      console.error('Failed to get replication lag:', error);
      return { lagSeconds: 0, lagBytes: 0, status: 'error' };
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate SQL scripts
   */
  generateSQL(): string {
    return `
-- Supabase Advanced Features - Monitoring Views
-- Generated on ${new Date().toISOString()}

-- Enable pg_stat_statements if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Database overview view
CREATE OR REPLACE VIEW db_overview AS
SELECT 
  'Database Overview' as metric,
  (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
  (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
  (SELECT count(*) FROM pg_stat_activity) as total_connections,
  (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
  (SELECT pg_size_pretty(pg_database_size(current_database())) as database_size),
  (SELECT version()) as postgres_version;

-- Table size overview
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
  schemaname || '.' || tablename as table_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
  (n_tup_ins + n_tup_upd + n_tup_del) as total_changes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  last_vacuum,
  last_analyze
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage statistics
CREATE OR REPLACE VIEW index_usage AS
SELECT 
  schemaname || '.' || tablename || '.' || indexrelname as index_name,
  schemaname || '.' || tablename as table_name,
  indexrelname as index_name_only,
  idx_scan as usage_count,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 10 THEN 'LOW USAGE'
    WHEN idx_scan < 100 THEN 'MEDIUM USAGE'
    ELSE 'HIGH USAGE'
  END as usage_category
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Slow queries view
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time::numeric / 1000 as total_seconds,
  mean_time::numeric / 1000 as mean_seconds,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 1000 -- More than 1 second average
ORDER BY mean_time DESC
LIMIT 20;

-- Lock monitoring view
CREATE OR REPLACE VIEW lock_monitor AS
SELECT 
  locktype,
  CASE 
    WHEN locktype = 'relation' THEN 
      (SELECT schemaname || '.' || relname FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.oid = relation)
    ELSE 'N/A'
  END as object_name,
  mode,
  granted,
  CASE 
    WHEN NOT granted THEN 'BLOCKING'
    ELSE 'GRANTED'
  END as status,
  count(*) as lock_count
FROM pg_locks
GROUP BY locktype, mode, granted, relation
ORDER BY NOT granted DESC, lock_count DESC;

-- Connection details view
CREATE OR REPLACE VIEW connection_details AS
SELECT 
  pid,
  datname as database,
  usename as username,
  application_name,
  client_addr,
  backend_start,
  query_start,
  state,
  CASE 
    WHEN state = 'active' THEN 'Running query'
    WHEN state = 'idle' THEN 'Idle'
    WHEN state = 'idle in transaction' THEN 'Idle in transaction'
    ELSE state
  END as status,
  LEFT(query, 100) as current_query
FROM pg_stat_activity
ORDER BY backend_start;

-- Storage usage by schema
CREATE OR REPLACE VIEW schema_sizes AS
SELECT 
  schema_name,
  pg_size_pretty(sum(table_size)) as total_size,
  sum(table_size) as size_bytes,
  count(*) as table_count
FROM (
  SELECT 
    schemaname as schema_name,
    pg_total_relation_size(schemaname||'.'||tablename) as table_size
  FROM pg_tables
  UNION ALL
  SELECT 
    schemaname as schema_name,
    pg_total_relation_size(schemaname||'.'||viewname) as table_size
  FROM pg_views
) schema_tables
GROUP BY schema_name
ORDER BY sum(table_size) DESC;

-- Bloat estimation view
CREATE OR REPLACE VIEW table_bloat AS
SELECT 
  current_database(),
  schemaname,
  tablename,
  ROUND(
    (
      CASE 
        WHEN otta=0 THEN 0.0
        ELSE sml.relpages/otta::numeric
      END - 1
    ) * 100
  ) AS bloat_percentage,
  CASE 
    WHEN otta=0 THEN 0
    ELSE sml.relpages::bigint - otta
  END AS wasted_bytes,
  CASE 
    WHEN otta=0 THEN 0
    ELSE bs*(sml.relpages::bigint - otta)
  END AS wasted_size
FROM (
  SELECT 
    schemaname, 
    tablename, 
    cc.reltuples, 
    cc.relpages, 
    bs,
    CEIL((cc.reltuples*((datahdr+ma-
      (CASE WHEN datahdr%ma=0 THEN ma ELSE datahdr%ma END)+nullhdr2+4))/(bs-20::float))) AS otta
  FROM (
    SELECT 
      ma,bs,fo,datahdr,header,b1,b2,qr,b3,b4,b5,b6,b7,b8,b9,b10,b11,b12,b13,b14,b15,b16,
      b17,b18,b19,b20,coalesce(nullhdr2,0) AS nullhdr2,
      coalesce(4,0) AS datahdr,
      (
        CASE 
          WHEN substring(v,12,3) IN ('8.0','8.1','8.2') THEN 27
          WHEN substring(v,12,3) = '8.3' THEN 23
          ELSE 23
        END
      ) AS nullhdr
    FROM (
      SELECT 
        tablespace, 
        (SELECT setting::int FROM pg_settings WHERE name='block_size') AS bs,
        (SELECT setting::int FROM pg_settings WHERE name='random_page_cost') AS fo,
        23 AS ma,
        4 AS b1,
        0 AS b2,
        0 AS b3,
        0 AS b4,
        0 AS b5,
        0 AS b6,
        0 AS b7,
        0 AS b8,
        0 AS b9,
        0 AS b10,
        0 AS b11,
        0 AS b12,
        0 AS b13,
        0 AS b14,
        0 AS b15,
        0 AS b16,
        0 AS b17,
        0 AS b18,
        0 AS b19,
        0 AS b20,
        version() AS v
    ) AS foo
  ) AS rs
  JOIN pg_class cc ON cc.relkind = 'r'
  JOIN pg_namespace nn ON cc.relnamespace = nn.oid AND nn.nspname NOT IN ('information_schema','pg_catalog')
) AS sml
WHERE NOT (
  schemaname='pg_catalog' AND 
  tablename IN ('pg_statistic','pg_type')
);

-- Query performance trends
CREATE OR REPLACE VIEW query_performance_trends AS
SELECT 
  query,
  calls,
  total_time::numeric / 1000 as total_seconds,
  mean_time::numeric / 1000 as mean_seconds,
  stddev_time::numeric / 1000 as stddev_seconds,
  min_time::numeric / 1000 as min_seconds,
  max_time::numeric / 1000 as max_seconds,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 50;

-- User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  usename,
  count(*) as connection_count,
  count(CASE WHEN state = 'active' THEN 1 END) as active_queries,
  count(CASE WHEN state = 'idle' THEN 1 END) as idle_connections,
  max(backend_start) as oldest_connection,
  array_agg(DISTINCT application_name) as applications
FROM pg_stat_activity
WHERE usename IS NOT NULL
GROUP BY usename
ORDER BY connection_count DESC;

-- Cache hit ratios
CREATE OR REPLACE VIEW cache_hit_ratios AS
SELECT 
  'Table Cache Hit Ratio' as metric,
  ROUND(
    (sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0)) * 100, 2
  ) as percentage
FROM pg_statio_user_tables
UNION ALL
SELECT 
  'Index Cache Hit Ratio' as metric,
  ROUND(
    (sum(idx_blks_hit) / nullif(sum(idx_blks_hit) + sum(idx_blks_read), 0)) * 100, 2
  ) as percentage
FROM pg_statio_user_indexes
UNION ALL
SELECT 
  'Disk Cache Hit Ratio' as metric,
  ROUND(
    (sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0)) * 100, 2
  ) as percentage
FROM pg_statio_user_tables;

-- Function to get database health score
CREATE OR REPLACE FUNCTION get_database_health_score()
RETURNS TABLE(
  metric text,
  value numeric,
  weight numeric,
  weighted_score numeric
) AS $$
BEGIN
  RETURN QUERY
  -- Connection usage (25% weight)
  SELECT 
    'Connection Usage'::text,
    (SELECT ROUND((count(*)::float / setting::int) * 100, 2) 
     FROM pg_stat_activity, pg_settings 
     WHERE name = 'max_connections'),
    25,
    (SELECT ROUND((count(*)::float / setting::int) * 100 * 0.25, 2) 
     FROM pg_stat_activity, pg_settings 
     WHERE name = 'max_connections')
  
  UNION ALL
  
  -- Cache hit ratio (25% weight)
  SELECT 
    'Cache Hit Ratio'::text,
    (SELECT ROUND((sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0)) * 100, 2)
     FROM pg_statio_user_tables),
    25,
    (SELECT ROUND((sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0)) * 100 * 0.25, 2)
     FROM pg_statio_user_tables)
  
  UNION ALL
  
  -- Index usage (25% weight)
  SELECT 
    'Index Usage'::text,
    (SELECT ROUND((COUNT(CASE WHEN idx_scan > 0 THEN 1 END)::float / COUNT(*)) * 100, 2)
     FROM pg_stat_user_indexes),
    25,
    (SELECT ROUND((COUNT(CASE WHEN idx_scan > 0 THEN 1 END)::float / COUNT(*)) * 100 * 0.25, 2)
     FROM pg_stat_user_indexes)
  
  UNION ALL
  
  -- Vacuum/Analyze recency (25% weight)
  SELECT 
    'Maintenance Recency'::text,
    (SELECT ROUND(AVG(
      CASE 
        WHEN last_vacuum > NOW() - INTERVAL '7 days' AND 
             last_analyze > NOW() - INTERVAL '7 days' THEN 100
        WHEN last_vacuum > NOW() - INTERVAL '30 days' AND 
             last_analyze > NOW() - INTERVAL '30 days' THEN 70
        WHEN last_vacuum > NOW() - INTERVAL '90 days' AND 
             last_analyze > NOW() - INTERVAL '90 days' THEN 40
        ELSE 10
      END), 2)
     FROM pg_stat_user_tables),
    25,
    (SELECT ROUND(AVG(
      CASE 
        WHEN last_vacuum > NOW() - INTERVAL '7 days' AND 
             last_analyze > NOW() - INTERVAL '7 days' THEN 100
        WHEN last_vacuum > NOW() - INTERVAL '30 days' AND 
             last_analyze > NOW() - INTERVAL '30 days' THEN 70
        WHEN last_vacuum > NOW() - INTERVAL '90 days' AND 
             last_analyze > NOW() - INTERVAL '90 days' THEN 40
        ELSE 10
      END) * 0.25, 2)
     FROM pg_stat_user_tables);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to authenticated users
GRANT SELECT ON db_overview TO authenticated;
GRANT SELECT ON table_sizes TO authenticated;
GRANT SELECT ON index_usage TO authenticated;
GRANT SELECT ON slow_queries TO authenticated;
GRANT SELECT ON lock_monitor TO authenticated;
GRANT SELECT ON connection_details TO authenticated;
GRANT SELECT ON schema_sizes TO authenticated;
GRANT SELECT ON table_bloat TO authenticated;
GRANT SELECT ON query_performance_trends TO authenticated;
GRANT SELECT ON user_activity_summary TO authenticated;
GRANT SELECT ON cache_hit_ratios TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_health_score() TO authenticated;
`;
  }

  private async getConnectionMetrics() {
    // Simulate connection metrics
    return {
      active: 15,
      idle: 25,
      total: 40,
      max: 100
    };
  }

  private async getPerformanceMetrics() {
    // Simulate performance metrics
    return {
      queryTime: 45.2,
      slowQueries: 3,
      cacheHitRatio: 94.5,
      indexUsage: 87.3
    };
  }

  private async getStorageMetrics() {
    // Simulate storage metrics
    return {
      size: 2048576000, // 2GB
      tables: 25,
      indexes: 48,
      bloat: 5.2
    };
  }

  private async getUserMetrics() {
    // Simulate user metrics
    return {
      total: 10,
      active: 8,
      roles: [
        { name: 'authenticated', members: 100, permissions: ['read', 'write'] },
        { name: 'service_role', members: 2, permissions: ['all'] }
      ]
    };
  }

  private loadViews(): void {
    // Load default views
    const defaultViews = [
      {
        name: 'db_overview',
        description: 'Database overview metrics',
        category: 'general'
      },
      {
        name: 'table_sizes',
        description: 'Table size and statistics',
        category: 'storage'
      },
      {
        name: 'index_usage',
        description: 'Index usage statistics',
        category: 'performance'
      },
      {
        name: 'slow_queries',
        description: 'Slow query analysis',
        category: 'performance'
      },
      {
        name: 'lock_monitor',
        description: 'Lock monitoring',
        category: 'performance'
      }
    ];

    defaultViews.forEach(view => {
      this.views.set(view.name, view);
    });
  }
}

// Export singleton instance
export const monitoringViews = new MonitoringViewsManager();
