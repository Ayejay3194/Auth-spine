import { Residual } from "../core/types";

export interface ErrorStats {
  maeLon: number;
  maeLat: number;
  rmseLon: number;
  rmseLat: number;
  p95Lon: number;
  p95Lat: number;
}

function p95(xs: number[]): number {
  if (xs.length === 0) return 0;
  const a = xs.slice().sort((x, y) => x - y);
  const idx = Math.floor(0.95 * (a.length - 1));
  return a[idx]!;
}

export function errorStats(truth: Residual[], pred: Residual[]): ErrorStats {
  const n = Math.min(truth.length, pred.length);
  const absLon: number[] = [];
  const absLat: number[] = [];
  const sqLon: number[] = [];
  const sqLat: number[] = [];

  for (let i = 0; i < n; i++) {
    const dLon = (pred[i]!.dLonArcsec - truth[i]!.dLonArcsec);
    const dLat = (pred[i]!.dLatArcsec - truth[i]!.dLatArcsec);
    absLon.push(Math.abs(dLon));
    absLat.push(Math.abs(dLat));
    sqLon.push(dLon * dLon);
    sqLat.push(dLat * dLat);
  }

  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  const maeLon = mean(absLon);
  const maeLat = mean(absLat);
  const rmseLon = Math.sqrt(mean(sqLon));
  const rmseLat = Math.sqrt(mean(sqLat));

  return {
    maeLon, maeLat,
    rmseLon, rmseLat,
    p95Lon: p95(absLon),
    p95Lat: p95(absLat),
  };
}
