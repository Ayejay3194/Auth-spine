/**
 * A/B Testing Framework (Advanced-ish)
 * - difference in means
 * - bootstrap CI
 * - simple sequential safety stop hooks (placeholder)
 */
export interface ABResult {
  meanA: number;
  meanB: number;
  lift: number;
  ci95: [number, number];
}

export function mean(xs: number[]): number { return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0; }

export function bootstrapLift(a: number[], b: number[], iters=2000, seed=42): ABResult {
  let s = seed>>>0;
  const rnd = ()=> (s=(1664525*s+1013904223)>>>0)/2**32;
  const mA = mean(a), mB = mean(b);
  const lift = (mB - mA) / (Math.abs(mA) || 1e-9);

  const lifts: number[] = [];
  for (let t=0;t<iters;t++){
    const sa = Array.from({length:a.length}, ()=> a[Math.floor(rnd()*a.length)] ?? 0);
    const sb = Array.from({length:b.length}, ()=> b[Math.floor(rnd()*b.length)] ?? 0);
    const la = mean(sa), lb = mean(sb);
    lifts.push((lb - la) / (Math.abs(la) || 1e-9));
  }
  lifts.sort((x,y)=>x-y);
  const lo = lifts[Math.floor(0.025*lifts.length)] ?? lift;
  const hi = lifts[Math.floor(0.975*lifts.length)] ?? lift;
  return { meanA: mA, meanB: mB, lift, ci95: [lo, hi] };
}
