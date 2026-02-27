/**
 * Reducers placeholder.
 * If you want PCA/UMAP, train/export elsewhere and run deterministic transforms here.
 */

import { Vec } from "../core/types";

export interface LinearReducer {
  // y = W x + b
  W: readonly Vec[]; // rows
  b?: Vec;
}

export function applyLinearReducer(x: Vec, r: LinearReducer): number[] {
  const out: number[] = [];
  for (let i = 0; i < r.W.length; i++) {
    const row = r.W[i]!;
    let s = 0;
    const n = Math.min(row.length, x.length);
    for (let j = 0; j < n; j++) s += row[j]! * x[j]!;
    s += (r.b?.[i] ?? 0);
    out.push(s);
  }
  return out;
}
