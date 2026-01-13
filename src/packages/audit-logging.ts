/**
 * Audit Logging for Supabase Advanced Features Pack
 * 
 * Provides comprehensive audit logging, change tracking,
 * and audit trail functionality for Supabase databases.
 */

import { AuditEvent } from './types.js';

export class AuditLoggingManager {
  private supabaseClient: any;
  private auditTables: Map<string, any> = new Map();
  private triggers: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize audit logging
   */
  async initialize(supabaseClient: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    await this.createAuditTables();
    await this.createAuditTriggers();
    this.initialized = true;
  }

  /**
   * Get audit events
   */
  async getEvents(filters: {
    tableName?: string;
    userId?: string;
    operation?: 'INSERT' | 'UPDATE' | 'DELETE';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<AuditEvent[]> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.tableName) {
      whereClause += ` AND table_name = $${paramIndex++}`;
      params.push(filters.tableName);
    }

    if (filters.userId) {
      whereClause += ` AND user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    if (filters.operation) {
      whereClause += ` AND operation = $${paramIndex++}`;
      params.push(filters.operation);
    }

    if (filters.startDate) {
      whereClause += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate.toISOString());
    }

    if (filters.endDate) {
      whereClause += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate.toISOString());
    }

    const limitClause = filters.limit ? `LIMIT $${paramIndex++}` : '';
    if (filters.limit) {
      params.push(filters.limit);
    }

    const sql = `
      SELECT 
        id,
        table_name,
        operation,
        user_id,
        created_at,
        old_values,
        new_values,
        metadata
      FROM audit_logs 
      ${whereClause}
      ORDER BY created_at DESC
      ${limitClause};
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql, params });
      if (error) throw error;
      
      return (data || []).map((event: any) => ({
        id: event.id,
        tableName: event.table_name,
        operation: event.operation,
        userId: event.user_id,
        timestamp: new Date(event.created_at),
        oldValues: event.old_values,
        newValues: event.new_values,
        metadata: event.metadata || {}
      }));
    } catch (error) {
      console.error('Failed to get audit events:', error);
      return [];
    }
  }

  /**
   * Create audit trigger for table
   */
  async createAuditTrigger(tableName: string, options: {
    trackInserts?: boolean;
    trackUpdates?: boolean;
    trackDeletes?: boolean;
    excludeColumns?: string[];
    includeColumns?: string[];
  } = {}): Promise<void> {
    const {
      trackInserts = true,
      trackUpdates = true,
      trackDeletes = true,
      excludeColumns = [],
      includeColumns
    } = options;

    let triggerFunction = `
      CREATE OR REPLACE FUNCTION audit_trigger_function_${tableName}()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'DELETE' THEN
          INSERT INTO audit_logs (
            table_name, 
            operation, 
            user_id, 
            old_values, 
            new_values,
            metadata
          ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            get_user_id(),
            row_to_json(OLD), 
            NULL,
            jsonb_build_object(
              'client_ip', get_client_ip(),
              'request_id', get_request_id(),
              'triggered_at', NOW()
            )
          );
          RETURN OLD;
        ELSIF TG_OP = 'INSERT' THEN
          INSERT INTO audit_logs (
            table_name, 
            operation, 
            user_id, 
            old_values, 
            new_values,
            metadata
          ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            get_user_id(),
            NULL, 
            row_to_json(NEW),
            jsonb_build_object(
              'client_ip', get_client_ip(),
              'request_id', get_request_id(),
              'triggered_at', NOW()
            )
          );
          RETURN NEW;
        ELSIF TG_OP = 'UPDATE' THEN
          INSERT INTO audit_logs (
            table_name, 
            operation, 
            user_id, 
            old_values, 
            new_values,
            metadata
          ) VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            get_user_id(),
            row_to_json(OLD), 
            row_to_json(NEW),
            jsonb_build_object(
              'client_ip', get_client_ip(),
              'request_id', get_request_id(),
              'triggered_at', NOW(),
              'changed_columns', (
                SELECT array_agg(key)
                FROM jsonb_object_keys(row_to_json(NEW)) key
                WHERE row_to_json(NEW)->>key IS DISTINCT FROM row_to_json(OLD)->>key
              )
            )
          );
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Apply column filtering if specified
    if (excludeColumns.length > 0 || includeColumns) {
      triggerFunction = this.applyColumnFiltering(triggerFunction, tableName, excludeColumns, includeColumns);
    }

    try {
      // Create trigger function
      await this.supabaseClient.rpc('exec_sql', { sql: triggerFunction });

      // Create trigger
      let triggerSQL = `DROP TRIGGER IF EXISTS audit_trigger_${tableName} ON ${tableName};\n`;
      
      if (trackInserts) {
        triggerSQL += `CREATE TRIGGER audit_trigger_${tableName} AFTER INSERT ON ${tableName} FOR EACH ROW EXECUTE FUNCTION audit_trigger_function_${tableName}();\n`;
      }
      
      if (trackUpdates) {
        triggerSQL += `CREATE TRIGGER audit_trigger_update_${tableName} AFTER UPDATE ON ${tableName} FOR EACH ROW EXECUTE FUNCTION audit_trigger_function_${tableName}();\n`;
      }
      
      if (trackDeletes) {
        triggerSQL += `CREATE TRIGGER audit_trigger_delete_${tableName} AFTER DELETE ON ${tableName} FOR EACH ROW EXECUTE FUNCTION audit_trigger_function_${tableName}();\n`;
      }

      await this.supabaseClient.rpc('exec_sql', { sql: triggerSQL });
      
      console.log(`Audit trigger created for table: ${tableName}`);
    } catch (error) {
      console.error(`Failed to create audit trigger for ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Remove audit trigger from table
   */
  async removeAuditTrigger(tableName: string): Promise<void> {
    const sql = `
      DROP TRIGGER IF EXISTS audit_trigger_${tableName} ON ${tableName};
      DROP TRIGGER IF EXISTS audit_trigger_update_${tableName} ON ${tableName};
      DROP TRIGGER IF EXISTS audit_trigger_delete_${tableName} ON ${tableName};
      DROP FUNCTION IF EXISTS audit_trigger_function_${tableName}();
    `;

    try {
      await this.supabaseClient.rpc('exec_sql', { sql });
      console.log(`Audit trigger removed from table: ${tableName}`);
    } catch (error) {
      console.error(`Failed to remove audit trigger from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getStatistics(period: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalEvents: number;
    eventsByTable: Record<string, number>;
    eventsByOperation: Record<string, number>;
    eventsByUser: Record<string, number>;
    topTables: Array<{ tableName: string; count: number }>;
    topUsers: Array<{ userId: string; count: number }>;
  }> {
    let timeFilter = '';
    switch (period) {
      case 'day':
        timeFilter = "AND created_at >= NOW() - INTERVAL '1 day'";
        break;
      case 'week':
        timeFilter = "AND created_at >= NOW() - INTERVAL '1 week'";
        break;
      case 'month':
        timeFilter = "AND created_at >= NOW() - INTERVAL '1 month'";
        break;
    }

    const sql = `
      WITH stats AS (
        SELECT 
          COUNT(*) as total_events,
          table_name,
          operation,
          user_id
        FROM audit_logs
        WHERE 1=1 ${timeFilter}
        GROUP BY table_name, operation, user_id
      )
      SELECT 
        COUNT(*) as total_events,
        jsonb_object_agg(table_name, table_count) as events_by_table,
        jsonb_object_agg(operation, operation_count) as events_by_operation,
        jsonb_object_agg(user_id, user_count) as events_by_user
      FROM (
        SELECT 
          COUNT(*) as total_events,
          table_name,
          operation,
          user_id,
          COUNT(*) OVER (PARTITION BY table_name) as table_count,
          COUNT(*) OVER (PARTITION BY operation) as operation_count,
          COUNT(*) OVER (PARTITION BY user_id) as user_count
        FROM stats
      ) aggregated;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql });
      if (error) throw error;

      const stats = data?.[0] || {};
      
      // Get top tables and users
      const topTablesSQL = `
        SELECT table_name, COUNT(*) as count
        FROM audit_logs
        WHERE 1=1 ${timeFilter}
        GROUP BY table_name
        ORDER BY count DESC
        LIMIT 10;
      `;

      const topUsersSQL = `
        SELECT user_id, COUNT(*) as count
        FROM audit_logs
        WHERE 1=1 ${timeFilter}
        GROUP BY user_id
        ORDER BY count DESC
        LIMIT 10;
      `;

      const [topTablesResult, topUsersResult] = await Promise.all([
        this.supabaseClient.rpc('exec_sql', { sql: topTablesSQL }),
        this.supabaseClient.rpc('exec_sql', { sql: topUsersSQL })
      ]);

      return {
        totalEvents: stats.total_events || 0,
        eventsByTable: stats.events_by_table || {},
        eventsByOperation: stats.events_by_operation || {},
        eventsByUser: stats.events_by_user || {},
        topTables: topTablesResult.data || [],
        topUsers: topUsersResult.data || []
      };
    } catch (error) {
      console.error('Failed to get audit statistics:', error);
      return {
        totalEvents: 0,
        eventsByTable: {},
        eventsByOperation: {},
        eventsByUser: {},
        topTables: [],
        topUsers: []
      };
    }
  }

  /**
   * Export audit logs
   */
  async exportLogs(filters: {
    tableName?: string;
    userId?: string;
    operation?: 'INSERT' | 'UPDATE' | 'DELETE';
    startDate?: Date;
    endDate?: Date;
    format?: 'json' | 'csv';
  } = {}): Promise<{
    data: string;
    filename: string;
    mimeType: string;
  }> {
    const events = await this.getEvents(filters);
    const format = filters.format || 'json';

    let data: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      data = this.convertToCSV(events);
      filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      data = JSON.stringify(events, null, 2);
      filename = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    return { data, filename, mimeType };
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
-- Supabase Advanced Features - Audit Logging
-- Generated on ${new Date().toISOString()}

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_created ON audit_logs(table_name, created_at);

-- Create audit summary view
CREATE OR REPLACE VIEW audit_summary AS
SELECT 
  table_name,
  operation,
  COUNT(*) as event_count,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
GROUP BY table_name, operation
ORDER BY event_count DESC;

-- Create audit timeline view
CREATE OR REPLACE VIEW audit_timeline AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  table_name,
  operation,
  COUNT(*) as event_count
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), table_name, operation
ORDER BY hour DESC;

-- Create user activity view
CREATE OR REPLACE VIEW user_activity AS
SELECT 
  user_id,
  COUNT(*) as total_events,
  COUNT(DISTINCT table_name) as tables_accessed,
  COUNT(DISTINCT operation) as operations_used,
  MIN(created_at) as first_activity,
  MAX(created_at) as last_activity
FROM audit_logs
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY total_events DESC;

-- Create table activity heatmap view
CREATE OR REPLACE VIEW table_activity_heatmap AS
SELECT 
  table_name,
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as event_count,
  COUNT(CASE WHEN operation = 'INSERT' THEN 1 END) as inserts,
  COUNT(CASE WHEN operation = 'UPDATE' THEN 1 END) as updates,
  COUNT(CASE WHEN operation = 'DELETE' THEN 1 END) as deletes
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY table_name, DATE_TRUNC('day', created_at)
ORDER BY day DESC, event_count DESC;

-- Function to get audit trail for specific record
CREATE OR REPLACE FUNCTION get_audit_trail(
  table_name_param TEXT,
  record_id UUID
)
RETURNS TABLE (
  id UUID,
  operation TEXT,
  user_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.operation,
    al.user_id,
    al.old_values,
    al.new_values,
    al.created_at,
    al.metadata
  FROM audit_logs al
  WHERE al.table_name = table_name_param
    AND (
      al.old_values->>'id' = record_id::text
      OR al.new_values->>'id' = record_id::text
    )
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get data changes for specific user
CREATE OR REPLACE FUNCTION get_user_data_changes(
  user_id_param UUID,
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  table_name TEXT,
  operation TEXT,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.table_name,
    al.operation,
    COALESCE(al.old_values->>'id', al.new_values->>'id')::UUID as record_id,
    CASE 
      WHEN al.operation = 'INSERT' THEN al.new_values
      WHEN al.operation = 'DELETE' THEN al.old_values
      ELSE jsonb_build_object(
        'old', al.old_values,
        'new', al.new_values,
        'changed', (
          SELECT jsonb_object_agg(
            key, 
            jsonb_build_object('old', al.old_values->key, 'new', al.new_values->key)
          )
          FROM jsonb_object_keys(al.new_values) key
          WHERE al.old_values->key IS DISTINCT FROM al.new_values->key
        )
      )
    END as changes,
    al.created_at
  FROM audit_logs al
  WHERE al.user_id = user_id_param
    AND al.created_at BETWEEN start_date AND end_date
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
  retention_days INTEGER DEFAULT 2555
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get audit compliance report
CREATE OR REPLACE FUNCTION get_audit_compliance_report(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  table_name TEXT,
  total_events BIGINT,
  insert_events BIGINT,
  update_events BIGINT,
  delete_events BIGINT,
  unique_users BIGINT,
  compliance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.table_name,
    COUNT(*) as total_events,
    COUNT(CASE WHEN al.operation = 'INSERT' THEN 1 END) as insert_events,
    COUNT(CASE WHEN al.operation = 'UPDATE' THEN 1 END) as update_events,
    COUNT(CASE WHEN al.operation = 'DELETE' THEN 1 END) as delete_events,
    COUNT(DISTINCT al.user_id) as unique_users,
    CASE 
      WHEN COUNT(DISTINCT al.user_id) > 0 THEN 
        ROUND((COUNT(*)::NUMERIC / COUNT(DISTINCT al.user_id)) / 10, 2) * 100
      ELSE 0
    END as compliance_score
  FROM audit_logs al
  WHERE al.created_at BETWEEN start_date AND end_date
  GROUP BY al.table_name
  ORDER BY total_events DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to authenticated users
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON audit_summary TO authenticated;
GRANT SELECT ON audit_timeline TO authenticated;
GRANT SELECT ON user_activity TO authenticated;
GRANT SELECT ON table_activity_heatmap TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_trail(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_data_changes(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_compliance_report(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- Grant admin permissions to service role
GRANT ALL ON audit_logs TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs(INTEGER) TO service_role;
`;
  }

  private async createAuditTables(): Promise<void> {
    const sql = this.generateSQL();
    await this.supabaseClient.rpc('exec_sql', { sql });
  }

  private async createAuditTriggers(): Promise<void> {
    // Load default triggers
    const defaultTriggers = [
      {
        tableName: 'users',
        trackInserts: true,
        trackUpdates: true,
        trackDeletes: true
      },
      {
        tableName: 'profiles',
        trackInserts: true,
        trackUpdates: true,
        trackDeletes: true
      }
    ];

    for (const trigger of defaultTriggers) {
      await this.createAuditTrigger(trigger.tableName, trigger);
    }
  }

  private applyColumnFiltering(
    triggerFunction: string,
    tableName: string,
    excludeColumns: string[],
    includeColumns?: string[]
  ): string {
    // Apply column filtering logic
    if (includeColumns) {
      // Include only specified columns
      const columnList = includeColumns.join(', ');
      triggerFunction = triggerFunction.replace(
        /row_to_json\(OLD\)/g,
        `row_to_json(row(OLD.${columnList}))`
      );
      triggerFunction = triggerFunction.replace(
        /row_to_json\(NEW\)/g,
        `row_to_json(row(NEW.${columnList}))`
      );
    } else if (excludeColumns.length > 0) {
      // Exclude specified columns
      triggerFunction = triggerFunction.replace(
        /row_to_json\(OLD\)/g,
        `row_to_json(OLD) - ${excludeColumns.map(col => `'${col}'`).join(' - ')}`
      );
      triggerFunction = triggerFunction.replace(
        /row_to_json\(NEW\)/g,
        `row_to_json(NEW) - ${excludeColumns.map(col => `'${col}'`).join(' - ')}`
      );
    }

    return triggerFunction;
  }

  private convertToCSV(events: AuditEvent[]): string {
    if (events.length === 0) return '';

    const headers = ['id', 'tableName', 'operation', 'userId', 'timestamp', 'oldValues', 'newValues', 'metadata'];
    const csvRows = [headers.join(',')];

    for (const event of events) {
      const row = [
        event.id,
        event.tableName,
        event.operation,
        event.userId || '',
        event.timestamp.toISOString(),
        JSON.stringify(event.oldValues || {}),
        JSON.stringify(event.newValues || {}),
        JSON.stringify(event.metadata || {})
      ];
      csvRows.push(row.map(cell => `"${cell}"`).join(','));
    }

    return csvRows.join('\n');
  }
}

// Export singleton instance
export const auditLogging = new AuditLoggingManager();
