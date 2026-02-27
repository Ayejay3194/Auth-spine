/**
 * Trainer placeholder.
 * Real training usually happens outside TS (Python), but you can keep dataset builders here.
 */

import { Residual } from "../core/types";

export interface TrainingRow {
  x: readonly number[];
  y: Residual;
}

export interface TrainSplit {
  train: TrainingRow[];
  test: TrainingRow[];
}

export function trainTestSplit(rows: TrainingRow[], testFrac: number, seed = 1): TrainSplit {
  // deterministic shuffle (LCG)
  let s = seed >>> 0;
  const rand = () => (s = (1664525 * s + 1013904223) >>> 0) / 2**32;

  const a = rows.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }

  const cut = Math.floor(a.length * (1 - testFrac));
  return { train: a.slice(0, cut), test: a.slice(cut) };
}
