import { Vec } from "../core/types";

export interface ZScoreAnomalyModel {
  mean: Vec;
  std: Vec;
  threshold: number;
}

export function zScoreAnomalyScore(x: Vec, m: ZScoreAnomalyModel): number {
  let worst = 0;
  for (let i = 0; i < Math.min(x.length, m.mean.length, m.std.length); i++) {
    const s = m.std[i] || 1e-9;
    const z = Math.abs((x[i] - m.mean[i]) / s);
    if (z > worst) worst = z;
  }
  return worst;
}

export function isAnomalous(x: Vec, m: ZScoreAnomalyModel): boolean {
  return zScoreAnomalyScore(x, m) >= m.threshold;
}
