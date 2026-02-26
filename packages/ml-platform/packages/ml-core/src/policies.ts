export interface DriftState {
  rollingMAE: number;
  rollingP95: number;
  samples: number;
}

export interface DriftPolicy {
  disableIfMAEAbove: number;
  disableIfP95Above: number;
  minSamples: number;
}

export function shouldDisableML(state: DriftState, policy: DriftPolicy): { disable: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (state.samples < policy.minSamples) return { disable: false, reasons: ["insufficient_samples"] };
  if (state.rollingMAE > policy.disableIfMAEAbove) reasons.push("mae_too_high");
  if (state.rollingP95 > policy.disableIfP95Above) reasons.push("p95_too_high");
  return { disable: reasons.length > 0, reasons };
}

export interface CanaryThresholds {
  maeMax: number;
  p95Max: number;
}
