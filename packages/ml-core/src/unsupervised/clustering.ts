import { Vec } from "../core/types";

export interface KMeansModel {
  centroids: readonly Vec[];
}

export function assignCluster(x: Vec, model: KMeansModel): { cluster: number; dist: number } {
  let best = -1;
  let bestDist = Infinity;

  const dist2 = (a: Vec, b: Vec) => {
    let s = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const d = a[i] - b[i];
      s += d * d;
    }
    return s;
  };

  for (let i = 0; i < model.centroids.length; i++) {
    const d = dist2(x, model.centroids[i]!);
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return { cluster: best, dist: Math.sqrt(bestDist) };
}
