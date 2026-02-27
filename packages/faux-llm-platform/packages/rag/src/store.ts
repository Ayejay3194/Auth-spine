import type { Chunk } from "./chunk";

export interface RetrievalQuery {
  query: string;
  k: number;
  filter?: Record<string, unknown>;
}

export interface RagStore {
  upsert(chunks: Chunk[]): Promise<void>;
  retrieve(q: RetrievalQuery): Promise<Chunk[]>;
}

export class InMemoryKeywordStore implements RagStore {
  private chunks: Chunk[] = [];
  async upsert(chunks: Chunk[]): Promise<void> { this.chunks.push(...chunks); }
  async retrieve(q: RetrievalQuery): Promise<Chunk[]> {
    const terms = q.query.toLowerCase().split(/\s+/).filter(Boolean);
    const score = (t: string) => terms.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
    return this.chunks
      .map(c => ({ c, s: score(c.text.toLowerCase()) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, q.k)
      .map(x => x.c);
  }
}
