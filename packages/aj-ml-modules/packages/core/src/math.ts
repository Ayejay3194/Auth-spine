import type { Matrix, Vector } from "./types";

export function dot(a: Vector, b: Vector): number {
  let s = 0; for (let i=0;i<a.length;i++) s += (a[i] ?? 0) * (b[i] ?? 0); return s;
}
export function mean(v: Vector): number { let s=0; for (const x of v) s += x; return v.length? s/v.length : 0; }
export function variance(v: Vector): number {
  const m = mean(v); let s=0; for (const x of v){ const d=x-m; s += d*d; } return v.length? s/v.length : 0;
}
export function matVec(X: Matrix, w: Vector): Vector {
  const out: Vector = new Array(X.length).fill(0);
  for (let i=0;i<X.length;i++){ const r=X[i] ?? []; let s=0; for (let j=0;j<r.length;j++) s += (r[j] ?? 0) * (w[j] ?? 0); out[i]=s; }
  return out;
}
export function sigmoid(z: number): number {
  if (z>=0){ const e=Math.exp(-z); return 1/(1+e); }
  const e=Math.exp(z); return e/(1+e);
}
export function argmax(v: Vector): number { let bi=0,bv=-Infinity; for (let i=0;i<v.length;i++) if ((v[i]??-Infinity)>bv){bv=v[i]??-Infinity;bi=i;} return bi; }
