import type { Matrix } from "../types.js";

export interface VarianceThresholdResult {
  keepIdx: number[];
  variances: number[];
}

/** Simple variance threshold feature selection */
export function varianceThreshold(X: Matrix, threshold: number): VarianceThresholdResult {
  if (X.length === 0) throw new Error("X empty");
  const n = X.length;
  const d = X[0]!.length;
  const mean = new Float64Array(d);

  for (const x of X) for (let j = 0; j < d; j++) mean[j] += x[j]!;
  for (let j = 0; j < d; j++) mean[j] /= n;

  const varr = new Float64Array(d);
  for (const x of X) for (let j = 0; j < d; j++) {
    const diff = x[j]! - mean[j]!;
    varr[j] += diff * diff;
  }
  const variances = Array.from(varr, v => v / Math.max(1, n - 1));

  const keepIdx: number[] = [];
  for (let j = 0; j < d; j++) {
    if (variances[j]! >= threshold) keepIdx.push(j);
  }

  return { keepIdx, variances };
}

export function selectColumns(X: Matrix, keepIdx: number[]): Matrix {
  return X.map(row => {
    const out = new Float64Array(keepIdx.length);
    for (let i = 0; i < keepIdx.length; i++) out[i] = row[keepIdx[i]!]!;
    return out;
  });
}
