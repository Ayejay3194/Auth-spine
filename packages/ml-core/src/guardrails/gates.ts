import { EphemerisInput, EphemerisOutput, Residual, Prediction } from "../core/types";

export interface GateConfig {
  maxAbsCorrectionArcsec: number;
  minConfidenceToApply: number;
  maxJumpArcsecPerStep: number;
  allowBodies?: Set<string>;
}

export interface GateContext {
  baseline: EphemerisOutput;
  predictedResidual: Prediction<Residual>;
  previousAppliedResidual?: Residual;
}

export interface GateDecision {
  apply: boolean;
  residualToApply: Residual;
  reasons: string[];
  confidence: number;
}

export function decideResidualGate(
  input: EphemerisInput,
  cfg: GateConfig,
  ctx: GateContext
): GateDecision {
  const reasons: string[] = [];
  const conf = ctx.predictedResidual.confidence;

  if (cfg.allowBodies && !cfg.allowBodies.has(input.body)) {
    reasons.push("body_not_allowed");
    return { apply: false, residualToApply: { dLonArcsec: 0, dLatArcsec: 0 }, reasons, confidence: conf };
  }

  if (conf < cfg.minConfidenceToApply) {
    reasons.push("low_confidence");
    return { apply: false, residualToApply: { dLonArcsec: 0, dLatArcsec: 0 }, reasons, confidence: conf };
  }

  const raw = ctx.predictedResidual.value;
  const clamp = (x: number) => Math.max(-cfg.maxAbsCorrectionArcsec, Math.min(cfg.maxAbsCorrectionArcsec, x));
  let dLon = clamp(raw.dLonArcsec);
  let dLat = clamp(raw.dLatArcsec);

  if (Math.abs(raw.dLonArcsec) > cfg.maxAbsCorrectionArcsec) reasons.push("lon_clamped");
  if (Math.abs(raw.dLatArcsec) > cfg.maxAbsCorrectionArcsec) reasons.push("lat_clamped");

  if (ctx.previousAppliedResidual) {
    const jumpLon = Math.abs(dLon - ctx.previousAppliedResidual.dLonArcsec);
    const jumpLat = Math.abs(dLat - ctx.previousAppliedResidual.dLatArcsec);
    if (jumpLon > cfg.maxJumpArcsecPerStep || jumpLat > cfg.maxJumpArcsecPerStep) {
      reasons.push("discontinuous_jump");
      return { apply: false, residualToApply: { dLonArcsec: 0, dLatArcsec: 0 }, reasons, confidence: conf };
    }
  }

  return { apply: true, residualToApply: { dLonArcsec: dLon, dLatArcsec: dLat }, reasons, confidence: conf };
}
