/**
 * Search Helpers for Supabase Advanced Features Pack
 * 
 * Provides fuzzy search, trigram matching, and full-text search
 * functionality for Supabase databases.
 */

import { SearchResult } from './types.js';

export class SearchHelpersManager {
  private supabaseClient: any;
  private searchIndexes: Map<string, any> = new Map();
  private searchFunctions: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize search helpers
   */
  async initialize(supabaseClient: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    await this.loadSearchIndexes();
    await this.loadSearchFunctions();
    this.initialized = true;
  }

  /**
   * Search across tables
   */
  async search(query: string, options: {
    tables?: string[];
    limit?: number;
    fuzzy?: boolean;
    weights?: Record<string, number>;
    filters?: Record<string, any>;
  } = {}): Promise<SearchResult> {
    if (!this.initialized) {
      throw new Error('Search helpers not initialized');
    }

    const {
      tables = ['posts', 'profiles', 'documents'],
      limit = 10,
      fuzzy = true,
      weights = { title: 2, content: 1, description: 1.5 },
      filters = {}
    } = options;

    try {
      const searchResults = [];
      
      for (const table of tables) {
        const tableResults = await this.searchTable(table, query, {
          fuzzy,
          weights,
          filters,
          limit: Math.ceil(limit / tables.length)
        });
        
        searchResults.push(...tableResults);
      }

      // Sort by rank and limit results
      const sortedResults = searchResults
        .sort((a, b) => b.rank - a.rank)
        .slice(0, limit);

      return {
        items: sortedResults,
        total: searchResults.length,
        query,
        took: Date.now()
      };
    } catch (error) {
      console.error('Search failed:', error);
      return {
        items: [],
        total: 0,
        query,
        took: Date.now()
      };
    }
  }

  /**
   * Search specific table
   */
  async searchTable(table: string, query: string, options: {
    fuzzy?: boolean;
    weights?: Record<string, number>;
    filters?: Record<string, any>;
    limit?: number;
  } = {}): Promise<Array<{
    id: string;
    table: string;
    rank: number;
    highlight: Record<string, string>;
    data: Record<string, any>;
  }>> {
    const {
      fuzzy = true,
      weights = {},
      filters = {},
      limit = 10
    } = options;

    try {
      let sql: string;
      let params: any[] = [query, limit];

      if (fuzzy) {
        // Use trigram similarity for fuzzy search
        sql = `
          SELECT 
            id,
            '${table}' as table_name,
            CASE 
              WHEN title IS NOT NULL THEN similarity(title, $1) * COALESCE($2::numeric, 1)
              WHEN name IS NOT NULL THEN similarity(name, $1) * COALESCE($2::numeric, 1)
              ELSE 0
            END +
            CASE 
              WHEN content IS NOT NULL THEN similarity(content, $1) * COALESCE($3::numeric, 1)
              WHEN description IS NOT NULL THEN similarity(description, $1) * COALESCE($3::numeric, 1)
              ELSE 0
            END as rank,
            ts_headline('english', COALESCE(title, name, ''), plainto_tsquery($1)) as title_highlight,
            ts_headline('english', COALESCE(content, description, ''), plainto_tsquery($1)) as content_highlight,
            *
          FROM ${table}
          WHERE 
            (title IS NOT NULL AND similarity(title, $1) > 0.1) OR
            (name IS NOT NULL AND similarity(name, $1) > 0.1) OR
            (content IS NOT NULL AND similarity(content, $1) > 0.1) OR
            (description IS NOT NULL AND similarity(description, $1) > 0.1)
          ORDER BY rank DESC
          LIMIT $4
        `;
        params = [query, weights.title || 2, weights.content || 1, limit];
      } else {
        // Use full-text search
        sql = `
          SELECT 
            id,
            '${table}' as table_name,
            ts_rank(search_vector, plainto_tsquery($1)) as rank,
            ts_headline('english', title, plainto_tsquery($1)) as title_highlight,
            ts_headline('english', content, plainto_tsquery($1)) as content_highlight,
            *
          FROM ${table}
          WHERE search_vector @@ plainto_tsquery($1)
          ORDER BY rank DESC
          LIMIT $2
        `;
        params = [query, limit];
      }

      // Add filters to SQL
      if (Object.keys(filters).length > 0) {
        const filterClauses = Object.entries(filters).map(([key, value], index) => {
          params.push(value);
          return `AND ${key} = $${params.length}`;
        }).join(' ');
        sql = sql.replace('ORDER BY rank DESC', `${filterClauses} ORDER BY rank DESC`);
      }

      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql, params });
      
      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        table: row.table_name,
        rank: row.rank,
        highlight: {
          title: row.title_highlight,
          content: row.content_highlight
        },
        data: this.sanitizeData(row)
      }));
    } catch (error) {
      console.error(`Failed to search table ${table}:`, error);
      return [];
    }
  }

  /**
   * Create search index
   */
  async createSearchIndex(tableName: string, columns: string[], options: {
    indexType?: 'gin' | 'gist';
    indexName?: string;
    unique?: boolean;
  } = {}): Promise<void> {
    const {
      indexType = 'gin',
      indexName = `idx_${tableName}_search`,
      unique = false
    } = options;

    try {
      // Create search vector column if it doesn't exist
      const vectorSQL = `
        ALTER TABLE ${tableName} 
        ADD COLUMN IF NOT EXISTS search_vector tsvector
        GENERATED ALWAYS AS (
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(description, '')), 'B')
        ) STORED;
      `;

      await this.supabaseClient.rpc('exec_sql', { sql: vectorSQL });

      // Create GIN index on search vector
      const indexSQL = `
        CREATE ${unique ? 'UNIQUE ' : ''}INDEX ${indexName} 
        ON ${tableName} USING ${indexType}(search_vector);
      `;

      await this.supabaseClient.rpc('exec_sql', { sql: indexSQL });

      // Create trigger to update search vector
      const triggerSQL = `
        CREATE OR REPLACE FUNCTION update_search_vector()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.search_vector := 
            setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_${tableName}_search_vector ON ${tableName};
        CREATE TRIGGER update_${tableName}_search_vector
        BEFORE INSERT OR UPDATE ON ${tableName}
        FOR EACH ROW EXECUTE FUNCTION update_search_vector();
      `;

      await this.supabaseClient.rpc('exec_sql', { sql: triggerSQL });

      // Update existing rows
      const updateSQL = `
        UPDATE ${tableName} 
        SET search_vector = 
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(description, '')), 'B');
      `;

      await this.supabaseClient.rpc('exec_sql', { sql: updateSQL });

      console.log(`Search index created for table: ${tableName}`);
    } catch (error) {
      console.error(`Failed to create search index for ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get similar records
   */
  async getSimilarRecords(
    tableName: string,
    column: string,
    value: string,
    threshold: number = 0.3,
    limit: number = 10
  ): Promise<Array<{
    id: string;
    similarity: number;
    data: any;
  }>> {
    const sql = `
      SELECT 
        id,
        similarity(${column}, $1) as similarity,
        *
      FROM ${tableName}
      WHERE similarity(${column}, $1) > $2
      ORDER BY similarity DESC
      LIMIT $3;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { 
        sql, 
        params: [value, threshold, limit] 
      });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        similarity: row.similarity,
        data: this.sanitizeData(row)
      }));
    } catch (error) {
      console.error('Failed to get similar records:', error);
      return [];
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string, options: {
    table?: string;
    column?: string;
    limit?: number;
  } = {}): Promise<string[]> {
    const {
      table = 'posts',
      column = 'title',
      limit = 5
    } = options;

    const sql = `
      SELECT DISTINCT ${column}
      FROM ${table}
      WHERE ${column} ILIKE $1
      ORDER BY LENGTH(${column}), ${column}
      LIMIT $2;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { 
        sql, 
        params: [`${query}%`, limit] 
      });

      if (error) throw error;

      return (data || []).map((row: any) => row[column]);
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<{
    totalIndexes: number;
    indexedTables: string[];
    averageQueryTime: number;
    popularQueries: Array<{
      query: string;
      count: number;
    }>;
  }> {
    // Mock implementation - in real scenario, this would query actual statistics
    return {
      totalIndexes: this.searchIndexes.size,
      indexedTables: Array.from(this.searchIndexes.keys()),
      averageQueryTime: 45.5,
      popularQueries: [
        { query: 'react', count: 150 },
        { query: 'typescript', count: 120 },
        { query: 'supabase', count: 100 }
      ]
    };
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
-- Supabase Advanced Features - Search Helpers
-- Generated on ${new Date().toISOString()}

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Search configuration
CREATE TEXT SEARCH CONFIGURATION english_nostop (
    COPY = english,
    STOPWORDS = ''
);

-- Search functions
CREATE OR REPLACE FUNCTION search_documents(
  query_text text,
  result_limit integer DEFAULT 10,
  min_rank real DEFAULT 0.1
)
RETURNS TABLE(
  id uuid,
  table_name text,
  title text,
  content text,
  rank real,
  highlight_title text,
  highlight_content text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    'documents'::text as table_name,
    d.title,
    d.content,
    ts_rank(d.search_vector, plainto_tsquery('english_nostop', query_text)) as rank,
    ts_headline('english_nostop', d.title, plainto_tsquery('english_nostop', query_text)) as highlight_title,
    ts_headline('english_nostop', d.content, plainto_tsquery('english_nostop', query_text)) as highlight_content
  FROM documents d
  WHERE d.search_vector @@ plainto_tsquery('english_nostop', query_text)
    AND ts_rank(d.search_vector, plainto_tsquery('english_nostop', query_text)) >= min_rank
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fuzzy_search(
  query_text text,
  similarity_threshold real DEFAULT 0.3,
  result_limit integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  table_name text,
  title text,
  similarity_score real,
  matched_text text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    'posts'::text as table_name,
    p.title,
    similarity(p.title, query_text) as similarity_score,
    p.title as matched_text
  FROM posts p
  WHERE similarity(p.title, query_text) >= similarity_threshold
  UNION ALL
  SELECT 
    d.id,
    'documents'::text as table_name,
    d.title,
    similarity(d.title, query_text) as similarity_score,
    d.title as matched_text
  FROM documents d
  WHERE similarity(d.title, query_text) >= similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION hybrid_search(
  query_text text,
  text_weight real DEFAULT 2.0,
  fuzzy_weight real DEFAULT 1.0,
  result_limit integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  table_name text,
  title text,
  content text,
  combined_rank real,
  text_rank real,
  fuzzy_rank real,
  highlight_title text,
  highlight_content text
) AS $$
BEGIN
  RETURN QUERY
  WITH text_search AS (
    SELECT 
      id,
      'posts'::text as table_name,
      title,
      content,
      ts_rank(search_vector, plainto_tsquery('english_nostop', query_text)) as text_rank,
      ts_headline('english_nostop', title, plainto_tsquery('english_nostop', query_text)) as highlight_title,
      ts_headline('english_nostop', content, plainto_tsquery('english_nostop', query_text)) as highlight_content
    FROM posts
    WHERE search_vector @@ plainto_tsquery('english_nostop', query_text)
  ),
  fuzzy_search AS (
    SELECT 
      id,
      similarity(title, query_text) as fuzzy_rank
    FROM posts
    WHERE similarity(title, query_text) > 0.1
  )
  SELECT 
    ts.id,
    ts.table_name,
    ts.title,
    ts.content,
    (ts.text_rank * $2 + COALESCE(fs.fuzzy_rank, 0) * $3) as combined_rank,
    ts.text_rank,
    COALESCE(fs.fuzzy_rank, 0) as fuzzy_rank,
    ts.highlight_title,
    ts.highlight_content
  FROM text_search ts
  LEFT JOIN fuzzy_search fs ON ts.id = fs.id
  ORDER BY combined_rank DESC
  LIMIT $4;
END;
$$ LANGUAGE plpgsql;

-- Search analytics functions
CREATE OR REPLACE FUNCTION log_search_query(
  user_id uuid,
  query_text text,
  results_count integer,
  execution_time_ms integer
)
RETURNS void AS $$
BEGIN
  INSERT INTO search_logs (user_id, query, results_count, execution_time, created_at)
  VALUES (user_id, query_text, results_count, execution_time, NOW());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_search_analytics(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  date date,
  total_searches bigint,
  unique_users bigint,
  avg_results numeric,
  avg_execution_time numeric,
  top_queries text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(results_count) as avg_results,
    AVG(execution_time) as avg_execution_time,
    ARRAY_AGG(query ORDER BY COUNT(*) DESC)[1:5] as top_queries
  FROM search_logs
  WHERE DATE(created_at) BETWEEN start_date AND end_date
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Search optimization functions
CREATE OR REPLACE FUNCTION optimize_search_indexes()
RETURNS TABLE(
  table_name text,
  index_name text,
  index_size text,
  index_usage bigint,
  recommendation text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    indexrelname as index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as index_usage,
    CASE 
      WHEN idx_scan = 0 THEN 'Consider dropping unused index'
      WHEN idx_scan < 100 THEN 'Low usage index - consider if needed'
      ELSE 'Index is actively used'
    END as recommendation
  FROM pg_stat_user_indexes
  WHERE indexrelname LIKE '%search%'
  ORDER BY idx_scan ASC;
END;
$$ LANGUAGE plpgsql;

-- Search suggestion functions
CREATE OR REPLACE FUNCTION get_search_suggestions(
  partial_query text,
  max_suggestions integer DEFAULT 5
)
RETURNS TABLE(
  suggestion text,
  frequency bigint,
  category text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query as suggestion,
    COUNT(*) as frequency,
    'popular'::text as category
  FROM search_logs
  WHERE query ILIKE partial_query || '%'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY query
  ORDER BY COUNT(*) DESC, LENGTH(query) ASC
  LIMIT max_suggestions
  
  UNION ALL
  
  SELECT 
    DISTINCT title as suggestion,
    0 as frequency,
    'content'::text as category
  FROM posts
  WHERE title ILIKE partial_query || '%'
    AND status = 'published'
  ORDER BY LENGTH(title) ASC
  LIMIT max_suggestions;
END;
$$ LANGUAGE plpgsql;

-- Create search logs table
CREATE TABLE IF NOT EXISTS search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  query text NOT NULL,
  results_count integer DEFAULT 0,
  execution_time integer DEFAULT 0, -- milliseconds
  created_at timestamptz DEFAULT NOW()
);

-- Create indexes for search logs
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs USING gin(to_tsvector('english', query));

-- Grant permissions
GRANT SELECT ON search_logs TO authenticated;
GRANT EXECUTE ON FUNCTION search_documents(text, integer, real) TO authenticated;
GRANT EXECUTE ON FUNCTION fuzzy_search(text, real, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION hybrid_search(text, real, real, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_suggestions(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION log_search_query(uuid, text, integer, integer) TO authenticated;

-- Grant admin permissions
GRANT ALL ON search_logs TO service_role;
GRANT EXECUTE ON FUNCTION get_search_analytics(date, date) TO service_role;
GRANT EXECUTE ON FUNCTION optimize_search_indexes() TO service_role;
`;
  }

  private sanitizeData(row: any): any {
    const { id, table_name, rank, title_highlight, content_highlight, ...data } = row;
    return data;
  }

  private loadSearchIndexes(): void {
    // Load default search indexes
    const defaultIndexes = [
      {
        tableName: 'posts',
        columns: ['title', 'content'],
        indexType: 'gin',
        indexName: 'idx_posts_search'
      },
      {
        tableName: 'documents',
        columns: ['title', 'description', 'content'],
        indexType: 'gin',
        indexName: 'idx_documents_search'
      }
    ];

    defaultIndexes.forEach(index => {
      this.searchIndexes.set(index.tableName, index);
    });
  }

  private loadSearchFunctions(): void {
    // Load default search functions
    const defaultFunctions = [
      {
        name: 'search_documents',
        description: 'Full-text search across documents',
        usage: 'SELECT * FROM search_documents(\'query\', 10, 0.1);'
      },
      {
        name: 'fuzzy_search',
        description: 'Fuzzy search using trigram similarity',
        usage: 'SELECT * FROM fuzzy_search(\'query\', 0.3, 10);'
      },
      {
        name: 'hybrid_search',
        description: 'Combination of full-text and fuzzy search',
        usage: 'SELECT * FROM hybrid_search(\'query\', 2.0, 1.0, 10);'
      }
    ];

    defaultFunctions.forEach(func => {
      this.searchFunctions.set(func.name, func);
    });
  }
}

// Export singleton instance
export const searchHelpers = new SearchHelpersManager();
