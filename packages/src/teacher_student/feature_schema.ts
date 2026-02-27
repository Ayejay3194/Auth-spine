/**
 * Student features MUST be:
 * - deterministic
 * - cheap
 * - stable across versions (or tracked with schemaHash)
 *
 * Keep this minimal: student is for runtime speed.
 */
export type StudentFeatureSchema = {
  // Astro summary features
  topTransitStrengths: number[];  // length K
  topTransitTypes: number[];      // categorical encoded as ints
  topTransitOrbs: number[];       // deg
  retroMask: number;              // bitmask of retro bodies
  pressureSupport: [number, number]; // from deterministic module
  // Vibe summary
  vibe: [number, number, number, number, number, number, number]; // arousal,warmth,def,coh,dom,vol,conf
};

export const DEFAULT_K = 6;

export function buildStudentFeatures(input: {
  topTransitStrengths: number[];
  topTransitTypes: number[];
  topTransitOrbs: number[];
  retroMask: number;
  pressureSupport: [number, number];
  vibe: [number, number, number, number, number, number, number];
}): number[] {
  const K = DEFAULT_K;
  const pad = (arr: number[], n: number, fill = 0) => {
    const out = arr.slice(0, n);
    while (out.length < n) out.push(fill);
    return out;
  };

  const a = pad(input.topTransitStrengths, K, 0);
  const b = pad(input.topTransitTypes, K, 0);
  const c = pad(input.topTransitOrbs, K, 99); // large orb = weak
  const [p, s] = input.pressureSupport;
  const v = input.vibe;

  return [...a, ...b, ...c, input.retroMask, p, s, ...v];
}
