-- Minimal multi-tenant schema for faux-llm-platform-v5
-- Requires PostgreSQL 13+

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  state_json JSONB NOT NULL,
  PRIMARY KEY (tenant_id, session_id, app_id)
);

CREATE TABLE IF NOT EXISTS events (
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  t BIGINT NOT NULL,
  type TEXT NOT NULL,
  data_json JSONB NOT NULL,
  PRIMARY KEY (tenant_id, app_id, session_id, event_id)
);

CREATE INDEX IF NOT EXISTS events_by_time
  ON events (tenant_id, app_id, session_id, t DESC);

CREATE TABLE IF NOT EXISTS memory_notes (
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  note_id TEXT NOT NULL,
  t BIGINT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence REAL NOT NULL,
  source TEXT NOT NULL,
  expires_at BIGINT NULL,
  deprecated_by TEXT NULL,
  PRIMARY KEY (tenant_id, app_id, note_id)
);

CREATE INDEX IF NOT EXISTS memory_by_key
  ON memory_notes (tenant_id, app_id, key);

CREATE TABLE IF NOT EXISTS feedback (
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  turn_id TEXT NOT NULL,
  score SMALLINT NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, app_id, session_id, turn_id)
);

-- RAG documents/chunks: keyword + metadata.
-- You can extend later with pgvector for embeddings.
CREATE TABLE IF NOT EXISTS documents (
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  doc_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (tenant_id, app_id, doc_id, version)
);

CREATE TABLE IF NOT EXISTS chunks (
  tenant_id TEXT NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  doc_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  chunk_id TEXT NOT NULL,
  text TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (tenant_id, app_id, doc_id, version, chunk_id)
);

-- Optional keyword search index
ALTER TABLE chunks
  ADD COLUMN IF NOT EXISTS tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(text,''))) STORED;

CREATE INDEX IF NOT EXISTS chunks_tsv_idx
  ON chunks USING GIN (tsv);
