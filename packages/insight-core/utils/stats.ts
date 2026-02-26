export function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] === undefined) return sorted[base];
  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}

export interface SummaryStats {
  n: number;
  p50: number;
  p95: number;
  p99: number;
  max: number;
  mean: number;
}

export function summarize(values: number[]): SummaryStats {
  const n = values.length;
  if (n === 0) return { n: 0, p50: NaN, p95: NaN, p99: NaN, max: NaN, mean: NaN };
  const sorted = [...values].sort((a,b)=>a-b);
  const sum = values.reduce((a,b)=>a+b, 0);
  return {
    n,
    p50: quantile(sorted, 0.50),
    p95: quantile(sorted, 0.95),
    p99: quantile(sorted, 0.99),
    max: sorted[sorted.length-1],
    mean: sum / n,
  };
}
