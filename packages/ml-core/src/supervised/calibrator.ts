/**
 * Minimal confidence calibration helper.
 * Idea: map raw "confidence" into calibrated confidence via piecewise bins.
 */

export interface BinCalibrator {
  // edges length = bins+1, probs length = bins
  edges: readonly number[];
  probs: readonly number[];
}

export function calibrate(conf: number, cal: BinCalibrator): number {
  const c = Math.max(0, Math.min(1, conf));
  const e = cal.edges;
  for (let i = 0; i < e.length - 1; i++) {
    if (c >= e[i]! && c < e[i + 1]!) return cal.probs[i] ?? c;
  }
  return cal.probs[cal.probs.length - 1] ?? c;
}
