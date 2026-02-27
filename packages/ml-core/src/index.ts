export * from "./core/types";
export * from "./core/errors";
export * from "./core/logger";
export * from "./core/versioning";

export * from "./guardrails/gates";
export * from "./guardrails/validators";
export * from "./guardrails/drift";
export * from "./guardrails/canary";

export * from "./features/featurePipeline";
export * from "./features/scalers";

export * from "./supervised/residualModel";
export * from "./supervised/linear";
export * from "./supervised/gbdtStub";
export * from "./supervised/metrics";
export * from "./supervised/trainer";
export * from "./supervised/calibrator";

export * from "./unsupervised/anomaly";
export * from "./unsupervised/clustering";
export * from "./unsupervised/reducers";

export * from "./policies/policyEngine";
export * from "./policies/defaults";

import { EphemerisInput, EphemerisOutput } from "./core/types";
import { validateInput, validateOutput } from "./guardrails/validators";
import { decideResidualGate, GateConfig } from "./guardrails/gates";
import { ResidualPredictor } from "./supervised/residualModel";

export interface DeterministicEngine {
  compute(input: EphemerisInput): EphemerisOutput;
}

export interface MlEngineConfig {
  enabled: boolean;
  gate: GateConfig;
}

export interface ComputeDiagnostics {
  inputIssues: string[];
  baselineIssues: string[];
  applied: boolean;
  gateReasons: string[];
  confidence: number;
}

export interface ComputeResult {
  baseline: EphemerisOutput;
  final: EphemerisOutput;
  diagnostics: ComputeDiagnostics;
}

export function applyResidual(baseline: EphemerisOutput, dLonArcsec: number, dLatArcsec: number): EphemerisOutput {
  const arcsecToDeg = (a: number) => a / 3600.0;
  return {
    ...baseline,
    lonDeg: baseline.lonDeg + arcsecToDeg(dLonArcsec),
    latDeg: baseline.latDeg + arcsecToDeg(dLatArcsec),
  };
}

export class HybridEphemerisEngine {
  constructor(
    private det: DeterministicEngine,
    private residualPredictor: ResidualPredictor,
    private cfg: MlEngineConfig
  ) {}

  compute(input: EphemerisInput): ComputeResult {
    const inputIssues = validateInput(input);

    const baseline = this.det.compute(input);
    const baselineIssues = validateOutput(baseline);

    // If deterministic output is broken, do not "fix" it with ML.
    if (baselineIssues.length > 0 || !this.cfg.enabled) {
      return {
        baseline,
        final: baseline,
        diagnostics: {
          inputIssues,
          baselineIssues,
          applied: false,
          gateReasons: baselineIssues.length ? ["baseline_invalid"] : ["ml_disabled"],
          confidence: 0
        }
      };
    }

    const pred = this.residualPredictor.predictResidual(input, baseline);
    const gate = decideResidualGate(input, this.cfg.gate, { baseline, predictedResidual: pred });

    const final = gate.apply
      ? applyResidual(baseline, gate.residualToApply.dLonArcsec, gate.residualToApply.dLatArcsec)
      : baseline;

    return {
      baseline,
      final,
      diagnostics: {
        inputIssues,
        baselineIssues,
        applied: gate.apply,
        gateReasons: gate.reasons,
        confidence: gate.confidence
      }
    };
  }
}
