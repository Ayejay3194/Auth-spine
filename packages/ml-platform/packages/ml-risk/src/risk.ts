import type { Model, Prediction } from "@aj/ml-core";

export interface RiskInput {
  actorId: string;               // user or business
  action: "message" | "signup" | "payment" | "post" | "booking";
  features: readonly number[];   // schema-stable
}

export interface RiskScore {
  score: number;     // 0..1
  tier: "low" | "medium" | "high";
}

export interface RiskModel extends Model<{ x: readonly number[] }, number> {}

export interface RiskPolicy {
  minConfidence: number;
  blockIfAbove: number;      // hard block threshold
  throttleIfAbove: number;   // rate limit threshold
}

export function scoreRisk(input: RiskInput, model: RiskModel, policy: RiskPolicy): { risk: RiskScore; decision: "allow" | "throttle" | "block"; diagnostics: Record<string, unknown> } {
  const pred: Prediction<number> = model.predict({ x: input.features });
  const raw = Math.max(0, Math.min(1, pred.value));
  const applied = pred.confidence >= policy.minConfidence;
  const score = applied ? raw : 0;

  const tier: RiskScore["tier"] =
    score >= 0.8 ? "high" :
    score >= 0.4 ? "medium" : "low";

  const decision =
    score >= policy.blockIfAbove ? "block" :
    score >= policy.throttleIfAbove ? "throttle" : "allow";

  return {
    risk: { score, tier },
    decision,
    diagnostics: { applied, confidence: pred.confidence, action: input.action }
  };
}
