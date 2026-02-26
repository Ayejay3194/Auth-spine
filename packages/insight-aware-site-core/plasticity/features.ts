import type { NowContext } from "../types/context.js";
import type { TensorFactory } from "./bioplausible/core/tensor.js";

/**
 * Deterministic feature extraction for online personalization.
 * No embeddings. No deps. Just measurable signals.
 *
 * Output shape: [F, 1]
 */
export const FEATURE_DIM = 16;

export function contextToFeatures(factory: TensorFactory, ctx: NowContext) {
  const hard = ctx.astro.topAspects.filter(a => a.type === "SQR" || a.type === "OPP").length;
  const soft = ctx.astro.topAspects.filter(a => a.type === "TRI" || a.type === "SEX").length;

  const f: number[] = [
    // Astro confidence / pressure
    clamp01(ctx.astro.systemConfidence),
    clamp01(hard / 6),
    clamp01(soft / 6),

    // Vibe core
    clamp01(ctx.vibe.arousal),
    clamp01(ctx.vibe.warmth),
    clamp01(ctx.vibe.defensiveness),
    clamp01(ctx.vibe.coherence),
    clamp01(ctx.vibe.dominance),
    clamp01(ctx.vibe.volatility),
    clamp01(ctx.vibe.confidence),

    // User prefs (acts like a stable conditioning vector)
    ctx.user.preferences.intensity / 3,
    ctx.user.preferences.receiptsDefault ? 1 : 0,
    ctx.user.preferences.tone === "clinical" ? 1 : 0,
    ctx.user.preferences.tone === "balanced" ? 1 : 0,
    ctx.user.preferences.tone === "sassy" ? 1 : 0,

    // Time-ish: fractional day from JD (gives daily rhythm signal)
    frac(ctx.astro.jd),
  ];

  while (f.length < FEATURE_DIM) f.push(0);
  const f2 = f.slice(0, FEATURE_DIM);

  return factory.fromFlatArray(f2, [FEATURE_DIM, 1]);
}

function frac(x: number): number {
  const r = x - Math.floor(x);
  return clamp01(r);
}

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}
