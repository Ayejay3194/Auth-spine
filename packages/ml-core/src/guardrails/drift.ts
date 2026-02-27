export interface DriftState {
  rollingMAEArcsec: number;
  rollingP95Arcsec: number;
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

  if (state.rollingMAEArcsec > policy.disableIfMAEAbove) reasons.push("mae_too_high");
  if (state.rollingP95Arcsec > policy.disableIfP95Above) reasons.push("p95_too_high");

  return { disable: reasons.length > 0, reasons };
}
