import { GateDecision, Prediction } from "./types";

/**
 * Generic clamp gate for numeric deltas/corrections.
 */
export interface ClampGateConfig {
  maxAbs: number;
  minConfidenceToApply: number;
  maxJumpPerStep?: number;
}

export function clampGate(
  cfg: ClampGateConfig,
  pred: Prediction<number>,
  prevApplied?: number
): GateDecision<number> {
  const reasons: string[] = [];
  const conf = pred.confidence;

  if (conf < cfg.minConfidenceToApply) {
    reasons.push("low_confidence");
    return { apply: false, valueToApply: 0, reasons, confidence: conf };
  }

  const clamp = (x: number) => Math.max(-cfg.maxAbs, Math.min(cfg.maxAbs, x));
  let v = clamp(pred.value);
  if (Math.abs(pred.value) > cfg.maxAbs) reasons.push("clamped");

  if (cfg.maxJumpPerStep != null && prevApplied != null) {
    const jump = Math.abs(v - prevApplied);
    if (jump > cfg.maxJumpPerStep) {
      reasons.push("discontinuous_jump");
      return { apply: false, valueToApply: 0, reasons, confidence: conf };
    }
  }

  return { apply: true, valueToApply: v, reasons, confidence: conf };
}
