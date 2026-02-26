import type { NowContext } from "../types/context.js";

export type ClinicalReply = {
  heading: string;
  bullets: string[];
  receipts: string[];
};

export function renderClinical(ctx: NowContext): ClinicalReply {
  const bullets: string[] = [];
  const top = ctx.astro.topAspects.slice(0, 5).map(a => `${a.a} ${a.type} ${a.b} | orb ${a.orbDeg.toFixed(2)}° | strength ${a.strength.toFixed(2)}`);
  bullets.push(...top);
  bullets.push(`Vibe: arousal ${ctx.vibe.arousal.toFixed(2)}, warmth ${ctx.vibe.warmth.toFixed(2)}, defensiveness ${ctx.vibe.defensiveness.toFixed(2)}, coherence ${ctx.vibe.coherence.toFixed(2)}.`);

  const receipts = [
    `UTC: ${ctx.utc}`,
    `JD: ${ctx.astro.jd.toFixed(5)}`,
    `Astro systemConfidence: ${ctx.astro.systemConfidence.toFixed(2)}`,
    `Vibe confidence: ${ctx.vibe.confidence.toFixed(2)}`,
    ...ctx.routing.riskFlags.map(r => `RiskFlag: ${r}`)
  ];

  return { heading: "Now Context", bullets, receipts };
}
