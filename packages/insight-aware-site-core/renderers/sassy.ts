import type { NowContext } from "../types/context.js";
import { clamp } from "../utils/math.js";

export type SassyReply = {
  text: string;
  suggestedModules: string[];
  receipts?: string[];
};

export function renderSassy(ctx: NowContext): SassyReply {
  const top = ctx.astro.topAspects[0];
  const p = clamp(0.45*ctx.vibe.defensiveness + 0.35*ctx.vibe.arousal + 0.20*(1-ctx.vibe.warmth), 0, 1);

  const lines: string[] = [];
  if (ctx.vibe.confidence < 0.35) {
    lines.push("Signal’s a little thin right now, so I’m not going to pretend I’m psychic. I’m using what I can actually measure.");
  }

  if (top) {
    lines.push(`Top transit: ${top.a} ${top.type} ${top.b} (orb ${top.orbDeg.toFixed(2)}°, ${top.applying ? "building" : "fading"}).`);
  }

  if (p > 0.70) lines.push("Pressure is up. If you start a fight today, at least make it productive.");
  else if (p > 0.55) lines.push("Moderate pressure. You can move, just don’t turn every conversation into a courtroom.");
  else lines.push("You’re clearer than you think. Use it before the vibe shifts again.");

  const suggestedModules = ctx.routing.suggestedModules.slice(0, 3);

  const receipts = ctx.user.preferences.receiptsDefault ? [
    `UTC: ${ctx.utc} | JD ${ctx.astro.jd.toFixed(5)}`,
    `Astro conf ${ctx.astro.systemConfidence.toFixed(2)} | Vibe conf ${ctx.vibe.confidence.toFixed(2)}`
  ] : undefined;

  return { text: lines.join("\n"), suggestedModules, receipts };
}
