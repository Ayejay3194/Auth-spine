import type { Dataset } from "./types";
import { mean, variance } from "./math";

export function describe(ds: Dataset){
  const X=ds.X; if(!X.length) return { n:0, d:0, features:[] as any[] };
  const d=X[0]!.length;
  const features = [];
  for(let j=0;j<d;j++){
    const col=X.map(r=>r[j]??0);
    const m=mean(col), v=variance(col);
    features.push({ name: ds.featureNames?.[j] ?? `x${j}`, mean:m, std:Math.sqrt(v), min:Math.min(...col), max:Math.max(...col) });
  }
  return { n:X.length, d, features };
}
