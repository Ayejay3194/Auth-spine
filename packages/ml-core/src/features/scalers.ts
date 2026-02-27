import { Vec } from "../core/types";

export interface StandardScalerModel {
  mean: Vec;
  std: Vec;
}

export function standardize(x: Vec, m: StandardScalerModel): number[] {
  const out: number[] = [];
  for (let i = 0; i < x.length; i++) {
    const mu = m.mean[i] ?? 0;
    const s = (m.std[i] ?? 1) || 1e-9;
    out.push((x[i] - mu) / s);
  }
  return out;
}
