import { createHash } from "crypto";
import { differenceInDays, differenceInMinutes } from "date-fns";

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const pct = (v: number) => `${Math.round(v * 100)}%`;
export const stableId = (...parts: Array<string | number>) => createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);

export const mean = (xs: number[]) => xs.length ? xs.reduce((s,x)=>s+x,0)/xs.length : 0;
export const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const a=[...xs].sort((x,y)=>x-y);
  const m=Math.floor(a.length/2);
  return a.length%2?a[m]:(a[m-1]+a[m])/2;
};

export const daysBetween = (a: Date, b: Date) => Math.abs(differenceInDays(a,b));
export const minutesBetween = (a: Date, b: Date) => Math.abs(differenceInMinutes(a,b));
