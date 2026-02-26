export interface RankItem {
  id: string;
  baseScore: number;               // deterministic score (rules / heuristics)
  features: readonly number[];      // ML features (schema-stable)
}

export interface RankResult {
  id: string;
  score: number;
  explanation?: Record<string, unknown>;
}
