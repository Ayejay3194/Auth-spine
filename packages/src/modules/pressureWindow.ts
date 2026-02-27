import type { Module } from "./moduleTypes.js";
import { clamp } from "../utils/math.js";

function pressureIndex(ctx: any): number {
  // crude composite: hard aspects + defensiveness + arousal
  const hard = ctx.astro.topAspects.filter((a: any) => a.type === "SQR" || a.type === "OPP" || a.type === "SESQ").slice(0, 5);
  const hardScore = hard.reduce((s: number, a: any) => s + a.strength, 0) / Math.max(1, hard.length);
  return clamp(0.45*hardScore + 0.35*ctx.vibe.defensiveness + 0.20*ctx.vibe.arousal, 0, 1);
}

function supportIndex(ctx: any): number {
  const soft = ctx.astro.topAspects.filter((a: any) => a.type === "TRI" || a.type === "SEX").slice(0, 5);
  const softScore = soft.reduce((s: number, a: any) => s + a.strength, 0) / Math.max(1, soft.length);
  return clamp(0.55*softScore + 0.45*ctx.vibe.warmth, 0, 1);
}

export const PressureWindow: Module = (ctx) => {
  const p = pressureIndex(ctx);
  const s = supportIndex(ctx);

  const label =
    p > 0.70 ? "High pressure window" :
    p > 0.55 ? "Moderate pressure window" :
    "Low pressure window";

  const advice =
    p > 0.70 ? "Keep decisions small and reversible. Friction is a feature right now." :
    p > 0.55 ? "You can move things forward, but avoid stacking hard conversations back-to-back." :
    "Green light for momentum. Don't overthink it.";

  const conf = clamp((ctx.astro.systemConfidence + ctx.vibe.confidence) / 2, 0, 1);

  return {
    id: "PressureWindow",
    title: "Pressure Window",
    summary: label,
    bullets: [
      `Pressure index: ${p.toFixed(2)} | Support index: ${s.toFixed(2)}`,
      advice,
      "Receipts: strongest aspects and current state signals are available in details."
    ],
    receipts: ctx.user.preferences.receiptsDefault
      ? ctx.astro.topAspects.slice(0, 6).map((a: any) => `${a.a} ${a.type} ${a.b} | orb ${a.orbDeg.toFixed(2)}° | strength ${a.strength.toFixed(2)}`)
      : undefined,
    confidence: conf,
    cta: { label: "Open Defense Style", href: "/modules/DefenseStyle" }
  };
};
