/**
 * Two-tower retrieval model stub:
 * - userEmbedding(user) and itemEmbedding(item) produce vectors
 * - score = dot(u, v)
 *
 * Train outside TS, export weights, implement deterministic forward pass here.
 */

export type Vec = readonly number[];

export interface EmbeddingModel<Input> {
  embed(input: Input): Vec;
}

export function dot(a: Vec, b: Vec): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += (a[i] ?? 0) * (b[i] ?? 0);
  return s;
}
