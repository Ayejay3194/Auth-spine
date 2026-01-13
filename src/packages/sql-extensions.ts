/**
 * SQL Extensions for Supabase Advanced Features Pack
 * 
 * Provides database extensions, monitoring views, and utility functions
 * for enhanced Supabase functionality.
 */

import { SQLEnvironment } from './types.js';

export class SQLExtensionsManager {
  private supabaseClient: any;
  private extensions: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize SQL extensions
   */
  async initialize(supabaseClient: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    await this.loadExtensions();
    this.initialized = true;
  }

  /**
   * Enable extension
   */
  async enableExtension(extensionName: string, schema: string = 'public'): Promise<void> {
    const sql = `CREATE EXTENSION IF NOT EXISTS "${extensionName}" SCHEMA ${schema};`;
    
    try {
      await this.supabaseClient.rpc('exec_sql', { sql });
      console.log(`Extension ${extensionName} enabled successfully`);
    } catch (error) {
      console.error(`Failed to enable extension ${extensionName}:`, error);
      throw error;
    }
  }

  /**
   * Get available extensions
   */
  async getAvailableExtensions(): Promise<Array<{
    name: string;
    version: string;
    description: string;
    installed: boolean;
  }>> {
    const sql = `
      SELECT 
        e.extname as name,
        e.extversion as version,
        pg_catalog.obj_description(e.oid, 'pg_extension') as description,
        true as installed
      FROM pg_extension e
      UNION ALL
      SELECT 
        name,
        'unknown' as version,
        description,
        false as installed
      FROM available_extensions
      WHERE name NOT IN (SELECT extname FROM pg_extension)
      ORDER BY name;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get available extensions:', error);
      return [];
    }
  }

  /**
   * Create custom function
   */
  async createFunction(functionDefinition: {
    name: string;
    parameters: Array<{
      name: string;
      type: string;
      mode?: 'IN' | 'OUT' | 'INOUT';
    }>;
    returnType: string;
    language: string;
    body: string;
    schema?: string;
    replace?: boolean;
  }): Promise<void> {
    const schema = functionDefinition.schema || 'public';
    const replace = functionDefinition.replace ? 'OR REPLACE' : '';
    
    const params = functionDefinition.parameters
      .map(p => `${p.mode || 'IN'} ${p.name} ${p.type}`)
      .join(', ');
    
    const sql = `
      CREATE ${replace} FUNCTION ${schema}.${functionDefinition.name}(${params})
      RETURNS ${functionDefinition.returnType}
      LANGUAGE ${functionDefinition.language}
      AS $$
      ${functionDefinition.body}
      $$;
    `;

    try {
      await this.supabaseClient.rpc('exec_sql', { sql });
      console.log(`Function ${functionDefinition.name} created successfully`);
    } catch (error) {
      console.error(`Failed to create function ${functionDefinition.name}:`, error);
      throw error;
    }
  }

  /**
   * Create trigger
   */
  async createTrigger(triggerDefinition: {
    name: string;
    table: string;
    event: 'BEFORE' | 'AFTER' | 'INSTEAD OF';
    operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE';
    function: string;
    schema?: string;
    replace?: boolean;
  }): Promise<void> {
    const schema = triggerDefinition.schema || 'public';
    const replace = triggerDefinition.replace ? 'OR REPLACE' : '';
    
    const sql = `
      CREATE ${replace} TRIGGER ${triggerDefinition.name}
      ${triggerDefinition.event} ${triggerDefinition.operation}
      ON ${schema}.${triggerDefinition.table}
      FOR EACH ROW
      EXECUTE FUNCTION ${triggerDefinition.function};
    `;

    try {
      await this.supabaseClient.rpc('exec_sql', { sql });
      console.log(`Trigger ${triggerDefinition.name} created successfully`);
    } catch (error) {
      console.error(`Failed to create trigger ${triggerDefinition.name}:`, error);
      throw error;
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
-- Supabase Advanced Features - SQL Extensions
-- Generated on ${new Date().toISOString()}

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "btree_gin" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "btree_gist" SCHEMA public;

-- Fuzzy search functions
CREATE OR REPLACE FUNCTION fuzzy_search(query text, table_name text, search_columns text[])
RETURNS TABLE(
  id uuid,
  rank real,
  highlight text
) AS $$
BEGIN
  RETURN QUERY
  EXECUTE format('
    SELECT 
      t.id,
      ts_rank_cd(search_vector, plainto_tsquery($1)) as rank,
      ts_headline(''english'', %s, plainto_tsquery($1)) as highlight
    FROM %I t
    WHERE search_vector @@ plainto_tsquery($1)
    ORDER BY rank DESC
    LIMIT 10
  ', array_to_string(search_columns, ' || '''' || '' || '''' || '), table_name, query);
END;
$$ LANGUAGE plpgsql;

-- Generate search vector
CREATE OR REPLACE FUNCTION generate_search_vector(title text, content text)
RETURNS tsvector AS $$
BEGIN
  RETURN
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Levenshtein distance function
CREATE OR REPLACE FUNCTION levenshtein(s1 text, s2 text)
RETURNS integer AS $$
BEGIN
  RETURN levenshtein(s1, s2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Similarity function using trigrams
CREATE OR REPLACE FUNCTION text_similarity(s1 text, s2 text)
RETURNS real AS $$
BEGIN
  RETURN similarity(s1, s2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Find similar records
CREATE OR REPLACE FUNCTION find_similar_records(
  table_name text,
  column_name text,
  search_text text,
  threshold real DEFAULT 0.3
)
RETURNS TABLE(
  id uuid,
  similarity real,
  matched_text text
) AS $$
BEGIN
  RETURN QUERY
  EXECUTE format('
    SELECT 
      t.id,
      similarity(t.%I, $2) as similarity,
      t.%I as matched_text
    FROM %I t
    WHERE similarity(t.%I, $2) > $1
    ORDER BY similarity DESC
    LIMIT 10
  ', column_name, column_name, table_name, column_name, threshold, search_text);
END;
$$ LANGUAGE plpgsql;

-- UUID utility functions
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS text AS $$
BEGIN
  RETURN substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Generate time-based UUID
CREATE OR REPLACE FUNCTION generate_time_uuid()
RETURNS uuid AS $$
BEGIN
  RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql VOLATILE;

-- JSON utility functions
CREATE OR REPLACE FUNCTION jsonb_deep_merge(target jsonb, source jsonb)
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    SELECT key,
    CASE
      WHEN jsonb_typeof(target->key) = 'object' AND jsonb_typeof(source->key) = 'object' THEN
        jsonb_deep_merge(target->key, source->key)
      ELSE
        COALESCE(source->key, target->key)
    END
    FROM jsonb_build_object(target, source) j(key)
    WHERE key IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Flatten JSONB
CREATE OR REPLACE FUNCTION flatten_jsonb(data jsonb, separator text DEFAULT '.')
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  key text;
  value jsonb;
BEGIN
  FOR key, value IN SELECT * FROM jsonb_each(data) LOOP
    IF jsonb_typeof(value) = 'object' THEN
      result := result || flatten_jsonb(value, separator || key || separator);
    ELSIF jsonb_typeof(value) = 'array' THEN
      result := result || jsonb_build_object(
        separator || key || '[]',
        value
      );
    ELSE
      result := result || jsonb_build_object(separator || key, value);
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Array utility functions
CREATE OR REPLACE FUNCTION array_unique(arr anyarray)
RETURNS anyarray AS $$
BEGIN
  RETURN array(
    SELECT DISTINCT unnest(arr)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION array_contains(arr anyarray, element anyelement)
RETURNS boolean AS $$
BEGIN
  RETURN element = ANY(arr);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Date/time utility functions
CREATE OR REPLACE FUNCTION business_days(start_date date, end_date date)
RETURNS integer AS $$
DECLARE
  days integer := 0;
  current_date date := start_date;
BEGIN
  WHILE current_date <= end_date LOOP
    IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
      days := days + 1;
    END IF;
    current_date := current_date + 1;
  END LOOP;
  
  RETURN days;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION quarter_start(date_val date)
RETURNS date AS $$
BEGIN
  RETURN date_trunc('quarter', date_val)::date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION quarter_end(date_val date)
RETURNS date AS $$
BEGIN
  RETURN date_trunc('quarter', date_val + interval '3 months' - interval '1 day')::date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- String utility functions
CREATE OR REPLACE FUNCTION slugify(text text)
RETURNS text AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(lower(text), '[^a-z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION extract_emails(text text)
RETURNS text[] AS $$
BEGIN
  RETURN array(
    SELECT regexp_matches[1]
    FROM regexp_matches(text, '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 'g') AS regexp_matches
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Numeric utility functions
CREATE OR REPLACE FUNCTION safe_divide(numerator numeric, denominator numeric, default_value numeric DEFAULT 0)
RETURNS numeric AS $$
BEGIN
  IF denominator = 0 THEN
    RETURN default_value;
  END IF;
  
  RETURN numerator / denominator;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION clamp(value numeric, min_value numeric, max_value numeric)
RETURNS numeric AS $$
BEGIN
  RETURN GREATEST(min_value, LEAST(max_value, value));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Audit helper functions
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_request_id()
RETURNS text AS $$
BEGIN
  RETURN current_setting('app.request_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_client_ip()
RETURNS inet AS $$
BEGIN
  RETURN current_setting('app.client_ip', true)::inet;
END;
$$ LANGUAGE plpgsql STABLE;

-- Performance monitoring functions
CREATE OR REPLACE FUNCTION get_table_stats(table_name text)
RETURNS TABLE(
  table_name text,
  row_count bigint,
  size_bytes bigint,
  index_size_bytes bigint,
  bloat_bytes bigint,
  last_vacuum timestamptz,
  last_analyze timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    n_tup_ins + n_tup_upd + n_tup_del as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size_bytes,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size_bytes,
    0 as bloat_bytes, -- Would need additional query for bloat
    last_vacuum,
    last_analyze
  FROM pg_stat_user_tables
  WHERE tablename = table_name;
END;
$$ LANGUAGE plpgsql;

-- Security utility functions
CREATE OR REPLACE FUNCTION mask_email(email text)
RETURNS text AS $$
BEGIN
  RETURN regexp_replace(
    email,
    '(.{2}).*(@.*)',
    '\\1***\\2'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION mask_phone(phone text)
RETURNS text AS $$
BEGIN
  RETURN regexp_replace(
    phone,
    '(.{3}).*(.{4})',
    '\\1****\\2'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Analytics helper functions
CREATE OR REPLACE FUNCTION calculate_growth_rate(current_value numeric, previous_value numeric)
RETURNS numeric AS $$
BEGIN
  IF previous_value = 0 THEN
    RETURN NULL;
  END IF;
  
  RETURN ((current_value - previous_value) / previous_value) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION moving_average(values numeric[], window_size integer)
RETURNS numeric AS $$
DECLARE
  total numeric := 0;
  count integer := 0;
  start_index integer;
BEGIN
  start_index := GREATEST(1, array_length(values, 1) - window_size + 1);
  
  FOR i IN start_index..array_length(values, 1) LOOP
    total := total + values[i];
    count := count + 1;
  END LOOP;
  
  IF count = 0 THEN
    RETURN NULL;
  END IF;
  
  RETURN total / count;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
`;
  }

  private loadExtensions(): void {
    // Load default extensions
    const defaultExtensions = [
      {
        name: 'uuid-ossp',
        version: '1.1',
        description: 'UUID generation functions',
        enabled: true
      },
      {
        name: 'pgcrypto',
        version: '1.3',
        description: 'Cryptographic functions',
        enabled: true
      },
      {
        name: 'pg_trgm',
        version: '1.4',
        description: 'Trigram matching for text similarity',
        enabled: true
      },
      {
        name: 'btree_gin',
        version: '1.3',
        description: 'GIN index support for B-tree operators',
        enabled: true
      },
      {
        name: 'btree_gist',
        version: '1.6',
        description: 'GiST index support for B-tree operators',
        enabled: true
      }
    ];

    defaultExtensions.forEach(extension => {
      this.extensions.set(extension.name, extension);
    });
  }
}

// Export singleton instance
export const sqlExtensions = new SQLExtensionsManager();
