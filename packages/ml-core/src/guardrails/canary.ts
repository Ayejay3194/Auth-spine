import { Residual } from "../core/types";

export interface CanarySample {
  id: string;
  truth: Residual;
  predicted: Residual;
}

export interface CanaryReport {
  ok: boolean;
  maeLon: number;
  maeLat: number;
  p95Lon: number;
  p95Lat: number;
}

function p95(xs: number[]): number {
  if (xs.length === 0) return 0;
  const a = xs.slice().sort((x, y) => x - y);
  const idx = Math.floor(0.95 * (a.length - 1));
  return a[idx]!;
}

export function runCanary(samples: CanarySample[], thresholds: { maeMax: number; p95Max: number }): CanaryReport {
  const absLon = samples.map(s => Math.abs(s.predicted.dLonArcsec - s.truth.dLonArcsec));
  const absLat = samples.map(s => Math.abs(s.predicted.dLatArcsec - s.truth.dLatArcsec));
  const maeLon = absLon.reduce((a, b) => a + b, 0) / Math.max(1, absLon.length);
  const maeLat = absLat.reduce((a, b) => a + b, 0) / Math.max(1, absLat.length);
  const p95Lon = p95(absLon);
  const p95Lat = p95(absLat);
  const ok = maeLon <= thresholds.maeMax && maeLat <= thresholds.maeMax && p95Lon <= thresholds.p95Max && p95Lat <= thresholds.p95Max;
  return { ok, maeLon, maeLat, p95Lon, p95Lat };
}
