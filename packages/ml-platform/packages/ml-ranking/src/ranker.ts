import type { Model, Prediction } from "@aj/ml-core";
import type { RankItem, RankResult } from "./types";

/**
 * Learning-to-rank hook:
 * - Your model predicts an additive delta to baseScore.
 * - Guardrails clamp delta and require confidence.
 */
export interface RankDeltaModel extends Model<{ x: readonly number[] }, number> {}

export interface RankGateConfig {
  maxAbsDelta: number;
  minConfidence: number;
}

export function rankItems(
  items: RankItem[],
  model: RankDeltaModel,
  gate: RankGateConfig
): RankResult[] {
  const clamp = (x: number) => Math.max(-gate.maxAbsDelta, Math.min(gate.maxAbsDelta, x));

  return items.map(it => {
    const pred: Prediction<number> = model.predict({ x: it.features });
    const delta = (pred.confidence >= gate.minConfidence) ? clamp(pred.value) : 0;
    const score = it.baseScore + delta;

    return {
      id: it.id,
      score,
      explanation: {
        baseScore: it.baseScore,
        deltaApplied: delta,
        confidence: pred.confidence,
        applied: pred.confidence >= gate.minConfidence
      }
    };
  }).sort((a, b) => b.score - a.score);
}
