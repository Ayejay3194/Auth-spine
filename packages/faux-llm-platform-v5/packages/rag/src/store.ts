import type { Chunk } from "./chunk";

export interface RetrievalQuery {
  query: string;
  k: number;
  filter?: Record<string, unknown>;
}

export interface ScoredChunk {
  chunk: Chunk;
  score: number;
}

export interface RagStore {
  upsert(chunks: Chunk[]): Promise<void>;
  retrieve(q: RetrievalQuery): Promise<Chunk[]>;
  retrieveScored?(q: RetrievalQuery): Promise<ScoredChunk[]>;
}

/**
 * Simple in-memory keyword baseline (not vector search).
 * It exists so you always have a baseline and a confidence signal.
 */
export class InMemoryKeywordStore implements RagStore {
  private chunks: Chunk[] = [];

  async upsert(chunks: Chunk[]): Promise<void> { this.chunks.push(...chunks); }

  private scoreChunk(textLower: string, terms: string[]): number {
    if (terms.length === 0) return 0;
    let s = 0;
    for (const w of terms) if (textLower.includes(w)) s += 1;
    // normalize by query length so longer queries don't inflate
    return s / terms.length;
  }

  async retrieveScored(q: RetrievalQuery): Promise<ScoredChunk[]> {
    const terms = q.query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.chunks
      .map(c => ({ chunk: c, score: this.scoreChunk(c.text.toLowerCase(), terms) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, q.k);
  }

  async retrieve(q: RetrievalQuery): Promise<Chunk[]> {
    const scored = await this.retrieveScored(q);
    return scored.map(s => s.chunk);
  }
}

/**
 * Retrieval confidence heuristic:
 * - looks at top score and the margin vs #2.
 */
export function retrievalConfidence(scored: ScoredChunk[]): number {
  if (scored.length === 0) return 0;
  const top = scored[0]!.score;
  const second = scored.length > 1 ? scored[1]!.score : 0;
  const margin = Math.max(0, top - second);
  // Weighted: top match + separation
  return Math.max(0, Math.min(1, 0.75 * top + 0.25 * margin));
}
