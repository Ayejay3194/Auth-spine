import type { Dataset, Split } from "./types";

export function trainTestSplit(ds: Dataset, testRatio=0.2, seed=42): Split {
  const n=ds.X.length; const idx=[...Array(n)].map((_,i)=>i);
  let s = seed>>>0;
  const rnd = ()=> (s = (1664525*s + 1013904223)>>>0) / 2**32;
  for (let i=n-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [idx[i],idx[j]]=[idx[j],idx[i]]; }
  const t=Math.max(1, Math.floor(n*testRatio)); const test=new Set(idx.slice(0,t));
  const Xtr:number[][]=[], Xte:number[][]=[]; const ytr:number[]=[], yte:number[]=[];
  for (let i=0;i<n;i++){
    const row=ds.X[i]!;
    const yi=ds.y?.[i];
    if (test.has(i)){ Xte.push(row); if (yi!=null) yte.push(yi); }
    else { Xtr.push(row); if (yi!=null) ytr.push(yi); }
  }
  return { train:{...ds,X:Xtr,y:ds.y?ytr:undefined}, test:{...ds,X:Xte,y:ds.y?yte:undefined} };
}
