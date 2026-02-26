export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}

export function p95(xs: number[]): number {
  if (xs.length === 0) return 0;
  const a = xs.slice().sort((x, y) => x - y);
  const idx = Math.floor(0.95 * (a.length - 1));
  return a[idx]!;
}

export function rmse(errs: number[]): number {
  return Math.sqrt(mean(errs.map(e => e * e)));
}
