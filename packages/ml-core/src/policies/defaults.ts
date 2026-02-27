import { GateConfig } from "../guardrails/gates";
import { DriftPolicy } from "../guardrails/drift";

export const defaultGate: GateConfig = {
  maxAbsCorrectionArcsec: 2.0,   // conservative default
  minConfidenceToApply: 0.7,
  maxJumpArcsecPerStep: 0.75,
};

export const defaultDriftPolicy: DriftPolicy = {
  disableIfMAEAbove: 1.5,
  disableIfP95Above: 4.0,
  minSamples: 200,
};
