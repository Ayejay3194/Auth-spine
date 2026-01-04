import type { ScoringService, ScoreResult } from "./types";

export class NoopScorer implements ScoringService {
  async score(key: string, _input: unknown): Promise<ScoreResult> {
    return { key, value: 0.5 };
  }
}
