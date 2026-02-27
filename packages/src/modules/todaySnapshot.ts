import type { Module } from "./moduleTypes.js";
import { clamp } from "../utils/math.js";

export const TodaySnapshot: Module = (ctx) => {
  const top = ctx.astro.topAspects.slice(0, 3);
  const aspectLines = top.map(a => `${a.a} ${a.type} ${a.b} (orb ${a.orbDeg.toFixed(2)}°, ${a.applying ? "applying" : "separating"})`);

  const vibeLine =
    ctx.vibe.confidence < 0.35
      ? "Vibe signal is low-confidence right now, so I'm going off what I can actually observe."
      : `Vibe right now: arousal ${ctx.vibe.arousal.toFixed(2)}, defensiveness ${ctx.vibe.defensiveness.toFixed(2)}, warmth ${ctx.vibe.warmth.toFixed(2)}.`;

  const conf = clamp((ctx.astro.systemConfidence*0.6 + ctx.vibe.confidence*0.4), 0, 1);

  return {
    id: "TodaySnapshot",
    title: "Today",
    summary: "Top signals for right now, with receipts.",
    bullets: [
      ...aspectLines,
      vibeLine,
      "Action: pick one small thing to finish cleanly. Under pressure, completion beats perfection."
    ],
    receipts: ctx.user.preferences.receiptsDefault ? buildReceipts(ctx) : undefined,
    confidence: conf,
    cta: { label: "Open Pressure Window", href: "/modules/PressureWindow" }
  };
};

function buildReceipts(ctx: any): string[] {
  const r: string[] = [];
  r.push(`UTC: ${ctx.utc} | JD: ${ctx.astro.jd.toFixed(5)}`);
  r.push(`Astro confidence: ${ctx.astro.systemConfidence.toFixed(2)} | Vibe confidence: ${ctx.vibe.confidence.toFixed(2)}`);
  return r;
}
