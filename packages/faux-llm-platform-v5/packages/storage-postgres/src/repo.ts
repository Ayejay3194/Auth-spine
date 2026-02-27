import type { Pool } from "pg";

export type Json = Record<string, any>;

export interface PgChunk { chunkId: string; text: string; meta?: Json; score?: number; }

export class Repo {
  constructor(private pool: Pool) {}

  async ensureTenant(tenantId: string): Promise<void> {
    await this.pool.query("INSERT INTO tenants(tenant_id) VALUES($1) ON CONFLICT DO NOTHING", [tenantId]);
  }

  async upsertSession(args: { tenantId: string; appId: string; sessionId: string; state: Json }): Promise<void> {
    await this.ensureTenant(args.tenantId);
    await this.pool.query(
      `INSERT INTO sessions(tenant_id, session_id, app_id, state_json)
       VALUES($1,$2,$3,$4)
       ON CONFLICT(tenant_id, session_id, app_id) DO UPDATE
       SET state_json = EXCLUDED.state_json, updated_at = now()`,
      [args.tenantId, args.sessionId, args.appId, args.state]
    );
  }

  async getSession(args: { tenantId: string; appId: string; sessionId: string }): Promise<Json | null> {
    const r = await this.pool.query(
      "SELECT state_json FROM sessions WHERE tenant_id=$1 AND app_id=$2 AND session_id=$3",
      [args.tenantId, args.appId, args.sessionId]
    );
    return r.rowCount ? (r.rows[0].state_json as Json) : null;
  }

  async insertEvent(args: { tenantId: string; appId: string; sessionId: string; eventId: string; t: number; type: string; data: Json }): Promise<void> {
    await this.ensureTenant(args.tenantId);
    await this.pool.query(
      `INSERT INTO events(tenant_id, app_id, session_id, event_id, t, type, data_json)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT DO NOTHING`,
      [args.tenantId, args.appId, args.sessionId, args.eventId, args.t, args.type, args.data]
    );
  }

  async putMemory(args: { tenantId: string; appId: string; note: Json }): Promise<void> {
    await this.ensureTenant(args.tenantId);
    const n = args.note;
    await this.pool.query(
      `INSERT INTO memory_notes(tenant_id, app_id, note_id, t, key, value, confidence, source, expires_at, deprecated_by)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT DO NOTHING`,
      [args.tenantId, args.appId, n.id, n.t, n.key, n.value, n.confidence, n.source, n.expiresAt ?? null, n.deprecatedBy ?? null]
    );
  }

  async deprecateMemory(args: { tenantId: string; appId: string; noteId: string; byNoteId: string }): Promise<void> {
    await this.pool.query(
      `UPDATE memory_notes SET deprecated_by=$1
       WHERE tenant_id=$2 AND app_id=$3 AND note_id=$4`,
      [args.byNoteId, args.tenantId, args.appId, args.noteId]
    );
  }

  async queryMemory(args: { tenantId: string; appId: string; key?: string; contains?: string; limit?: number }): Promise<Json[]> {
    const lim = args.limit ?? 20;
    if (args.key) {
      const r = await this.pool.query(
        `SELECT * FROM memory_notes
         WHERE tenant_id=$1 AND app_id=$2 AND key=$3 AND deprecated_by IS NULL
         ORDER BY confidence DESC, t DESC LIMIT $4`,
        [args.tenantId, args.appId, args.key, lim]
      );
      return r.rows as any;
    }
    if (args.contains) {
      const like = "%" + args.contains.toLowerCase() + "%";
      const r = await this.pool.query(
        `SELECT * FROM memory_notes
         WHERE tenant_id=$1 AND app_id=$2 AND deprecated_by IS NULL
           AND (lower(value) LIKE $3 OR lower(key) LIKE $3)
         ORDER BY confidence DESC, t DESC LIMIT $4`,
        [args.tenantId, args.appId, like, lim]
      );
      return r.rows as any;
    }
    const r = await this.pool.query(
      `SELECT * FROM memory_notes
       WHERE tenant_id=$1 AND app_id=$2 AND deprecated_by IS NULL
       ORDER BY confidence DESC, t DESC LIMIT $3`,
      [args.tenantId, args.appId, lim]
    );
    return r.rows as any;
  }

  async upsertChunks(args: { tenantId: string; appId: string; docId: string; version: number; chunks: Array<{ id: string; text: string; meta?: Json }> }): Promise<void> {
    await this.ensureTenant(args.tenantId);
    await this.pool.query(
      `INSERT INTO documents(tenant_id, app_id, doc_id, version)
       VALUES($1,$2,$3,$4)
       ON CONFLICT DO NOTHING`,
      [args.tenantId, args.appId, args.docId, args.version]
    );

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      for (const c of args.chunks) {
        await client.query(
          `INSERT INTO chunks(tenant_id, app_id, doc_id, version, chunk_id, text, meta)
           VALUES($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT(tenant_id, app_id, doc_id, version, chunk_id) DO UPDATE
           SET text=EXCLUDED.text, meta=EXCLUDED.meta`,
          [args.tenantId, args.appId, args.docId, args.version, c.id, c.text, c.meta ?? {}]
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async retrieveChunksScored(args: { tenantId: string; appId: string; query: string; k: number; docId?: string }): Promise<PgChunk[]> {
    // Keyword + tsvector ranking baseline (hybrid can be added with pgvector later)
    const q = args.query.trim();
    if (!q) return [];
    const docFilter = args.docId ? "AND doc_id=$4" : "";
    const params = args.docId ? [args.tenantId, args.appId, q, args.docId, args.k] : [args.tenantId, args.appId, q, args.k];

    const sql = args.docId
      ? `SELECT chunk_id, text, meta, ts_rank(tsv, plainto_tsquery('simple',$3)) AS score
         FROM chunks
         WHERE tenant_id=$1 AND app_id=$2 ${docFilter}
         ORDER BY score DESC
         LIMIT $5`
      : `SELECT chunk_id, text, meta, ts_rank(tsv, plainto_tsquery('simple',$3)) AS score
         FROM chunks
         WHERE tenant_id=$1 AND app_id=$2
         ORDER BY score DESC
         LIMIT $4`;

    const r = await this.pool.query(sql, params as any);
    return r.rows.map((row: any) => ({
      chunkId: row.chunk_id,
      text: row.text,
      meta: row.meta,
      score: typeof row.score === "number" ? row.score : Number(row.score ?? 0)
    }));
  }

  async insertFeedback(args: { tenantId: string; appId: string; sessionId: string; turnId: string; score: number; note?: string }): Promise<void> {
    await this.ensureTenant(args.tenantId);
    await this.pool.query(
      `INSERT INTO feedback(tenant_id, app_id, session_id, turn_id, score, note)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(tenant_id, app_id, session_id, turn_id) DO UPDATE
       SET score=EXCLUDED.score, note=EXCLUDED.note`,
      [args.tenantId, args.appId, args.sessionId, args.turnId, args.score, args.note ?? null]
    );
  }
}
