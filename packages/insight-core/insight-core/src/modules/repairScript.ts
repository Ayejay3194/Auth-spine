import type { Module } from "./moduleTypes.js";
import { clamp } from "../utils/math.js";

export const RepairScript: Module = (ctx) => {
  const def = ctx.vibe.defensiveness;
  const warm = ctx.vibe.warmth;

  const scripts: string[] = [];
  if (def > 0.60 && warm < 0.50) {
    scripts.push("“I’m getting defensive. I don’t want to fight. I want to solve it.”");
    scripts.push("“What’s the one outcome you actually want here?”");
  } else if (warm > 0.60) {
    scripts.push("“I’m on your side. Can we be honest without making it a trial?”");
    scripts.push("“What would repair look like to you, specifically?”");
  } else {
    scripts.push("“I want clarity, not drama. Can we name the issue in one sentence?”");
    scripts.push("“What’s your best-case read of my intent?”");
  }

  const conf = clamp(0.4 + 0.6*ctx.vibe.confidence, 0, 1);

  return {
    id: "RepairScript",
    title: "Repair Script",
    summary: "Concrete language to de-escalate without self-abandoning.",
    bullets: scripts,
    receipts: ctx.user.preferences.receiptsDefault ? [
      `Defensiveness ${def.toFixed(2)} | Warmth ${warm.toFixed(2)}`
    ] : undefined,
    confidence: conf
  };
};
