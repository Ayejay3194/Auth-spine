import type { Prediction } from "@aj/ml-core";
import { clampGate, type ClampGateConfig } from "@aj/ml-core";
import type { EphemerisInput, EphemerisOutput, Residual } from "./types";
import type { ResidualModel } from "./models";
import type { FeaturePipeline } from "@aj/ml-core";
import type { AstroFeatureContext } from "./features";

export interface DeterministicEphemerisEngine {
  compute(input: EphemerisInput): EphemerisOutput;
}

export interface AstroMlConfig {
  enabled: boolean;
  gate: { lon: ClampGateConfig; lat: ClampGateConfig };
}

export interface ComputeResult {
  baseline: EphemerisOutput;
  final: EphemerisOutput;
  diagnostics: {
    applied: boolean;
    reasons: string[];
    confidence: number;
  };
}

export function applyResidual(b: EphemerisOutput, r: Residual): EphemerisOutput {
  const arcsecToDeg = (a: number) => a / 3600.0;
  return { ...b, lonDeg: b.lonDeg + arcsecToDeg(r.dLonArcsec), latDeg: b.latDeg + arcsecToDeg(r.dLatArcsec) };
}

export class HybridAstroEngine {
  private prevLon?: number;
  private prevLat?: number;

  constructor(
    private det: DeterministicEphemerisEngine,
    private pipeline: FeaturePipeline<AstroFeatureContext>,
    private model: ResidualModel,
    private cfg: AstroMlConfig
  ) {}

  predictResidual(input: EphemerisInput, baseline: EphemerisOutput): Prediction<Residual> {
    const x = this.pipeline.featurize({ input, baseline });
    return this.model.predict({ x });
  }

  compute(input: EphemerisInput): ComputeResult {
    const baseline = this.det.compute(input);
    if (!this.cfg.enabled) {
      return { baseline, final: baseline, diagnostics: { applied: false, reasons: ["ml_disabled"], confidence: 0 } };
    }

    const pred = this.predictResidual(input, baseline);

    // gate lon/lat separately
    const lonGate = clampGate(this.cfg.gate.lon, { value: pred.value.dLonArcsec, confidence: pred.confidence }, this.prevLon);
    const latGate = clampGate(this.cfg.gate.lat, { value: pred.value.dLatArcsec, confidence: pred.confidence }, this.prevLat);

    const applied = lonGate.apply && latGate.apply;
    const reasons = [...lonGate.reasons.map(r => "lon_" + r), ...latGate.reasons.map(r => "lat_" + r)];
    const confidence = pred.confidence;

    const final = applied
      ? applyResidual(baseline, { dLonArcsec: lonGate.valueToApply, dLatArcsec: latGate.valueToApply })
      : baseline;

    if (applied) { this.prevLon = lonGate.valueToApply; this.prevLat = latGate.valueToApply; }

    return { baseline, final, diagnostics: { applied, reasons, confidence } };
  }
}
