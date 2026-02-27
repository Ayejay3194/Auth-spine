import type { Matrix, Vector } from "./types";
import { argmax, mean } from "./math";

export function mse(y:Vector,yhat:Vector):number{ let s=0; for(let i=0;i<y.length;i++){ const d=(yhat[i]??0)-(y[i]??0); s+=d*d;} return y.length? s/y.length:0; }
export function mae(y:Vector,yhat:Vector):number{ let s=0; for(let i=0;i<y.length;i++) s+=Math.abs((yhat[i]??0)-(y[i]??0)); return y.length? s/y.length:0; }
export function r2(y:Vector,yhat:Vector):number{
  const yb=mean(y); let ssRes=0, ssTot=0;
  for(let i=0;i<y.length;i++){ const yi=y[i]??0; const d=(yhat[i]??0)-yi; ssRes+=d*d; const t=yi-yb; ssTot+=t*t; }
  return ssTot? 1-ssRes/ssTot : 0;
}
export function accuracy(y:Vector,yhat:Vector):number{ let ok=0; for(let i=0;i<y.length;i++) if(Math.round(yhat[i]??0)===Math.round(y[i]??0)) ok++; return y.length? ok/y.length:0; }
export function accuracyFromProba(y:Vector,proba:Matrix):number{
  let ok=0; for(let i=0;i<y.length;i++){ const p=argmax(proba[i]??[]); if(p===Math.round(y[i]??0)) ok++; } return y.length? ok/y.length:0;
}
