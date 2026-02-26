import type { DriftPolicy } from "./policies";
import type { ClampGateConfig } from "./guardrails";

export const defaultGate: ClampGateConfig = {
  maxAbs: 1.0,
  minConfidenceToApply: 0.7,
  maxJumpPerStep: 0.5
};

export const defaultDriftPolicy: DriftPolicy = {
  disableIfMAEAbove: 1.5,
  disableIfP95Above: 4.0,
  minSamples: 200
};
