import type { Module } from "./moduleTypes.js";
import { clamp } from "../utils/math.js";

export const DefenseStyle: Module = (ctx) => {
  const d = ctx.vibe.defensiveness;
  const a = ctx.vibe.arousal;
  const c = ctx.vibe.coherence;

  const styles: string[] = [];
  if (d > 0.62 && a > 0.55) styles.push("Fight/Control: sharper tone, urgency, tightening standards.");
  if (d > 0.62 && a <= 0.55) styles.push("Freeze/Withdraw: short replies, low warmth, less engagement.");
  if (d <= 0.62 && c < 0.55) styles.push("Diffuse: topic drift, over-explaining, trying to smooth the room.");
  if (styles.length === 0) styles.push("Baseline: no strong defense pattern detected right now.");

  const conf = clamp(0.4 + 0.6*ctx.vibe.confidence, 0, 1);

  return {
    id: "DefenseStyle",
    title: "Defense Style",
    summary: "What your system is doing under stress (observed, not diagnosed).",
    bullets: [
      ...styles.slice(0, 3),
      "Move: name one need plainly, then stop negotiating with yourself."
    ],
    receipts: ctx.user.preferences.receiptsDefault ? [
      `Defensiveness ${d.toFixed(2)} | Arousal ${a.toFixed(2)} | Coherence ${c.toFixed(2)} | Confidence ${ctx.vibe.confidence.toFixed(2)}`
    ] : undefined,
    confidence: conf,
    cta: { label: "Open Repair Script", href: "/modules/RepairScript" }
  };
};
