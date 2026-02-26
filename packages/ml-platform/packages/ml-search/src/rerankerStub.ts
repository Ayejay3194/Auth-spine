/**
 * Reranker hook (for Solari memory retrieval, Drift feeds, Beauty discovery).
 * Start with heuristic rank, then apply learned delta (like @aj/ml-ranking).
 */
export interface Candidate {
  id: string;
  baseScore: number;
  features: readonly number[];
}

export interface Reranked {
  id: string;
  score: number;
}

export function rerankHeuristic(cands: Candidate[]): Reranked[] {
  return cands.slice().sort((a, b) => b.baseScore - a.baseScore).map(c => ({ id: c.id, score: c.baseScore }));
}
