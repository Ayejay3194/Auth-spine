import { NowContext } from "../fusion/nowContext";
import { TruthTeacherOutput } from "./types";

/**
 * TruthTeacher is OFFLINE / batch. In production you typically:
 * - log NowContext snapshots + outcomes
 * - train a heavier model
 * - output labels for distillation
 *
 * This stub provides a deterministic baseline so pipelines run end-to-end.
 */
export function truthTeacherBaseline(ctx: NowContext): TruthTeacherOutput {
  // Use existing modules as a conservative baseline "teacher".
  const pressure = ctx.routing?.riskFlags?.includes("pressure_high") ? 0.8 : 0.5;

  const vibe = ctx.vibe;
  const conflictRisk = clamp01(0.55 * vibe.defensiveness + 0.25 * vibe.arousal + 0.2 * vibe.volatility);
  const repairLikelihood = clamp01(0.6 * vibe.warmth + 0.3 * vibe.coherence + 0.1 * (1 - vibe.defensiveness));

  // Suggested modules: simple heuristic routing (replace with learned teacher).
  const suggestedModules = [
    { id: "TodaySnapshot", score: 0.7 },
    { id: "PressureWindow", score: pressure },
    { id: "DefenseStyle", score: clamp01(vibe.defensiveness + 0.1) },
    { id: "RelationshipLoop", score: clamp01(conflictRisk) },
  ].sort((a,b)=>b.score-a.score);

  return {
    pressureIndex: pressure,
    supportIndex: clamp01(1 - pressure),
    conflictRisk,
    repairLikelihood,
    suggestedModules,
    windows: ctx.astro.topAspects.slice(0,3).map((asp)=>({
      label: `${asp.a}-${asp.type}-${asp.b}`,
      startUtc: ctx.astro.utc,
      peakUtc: asp.peakAtUtc,
      endUtc: asp.endsAtUtc ?? ctx.astro.utc,
      confidence: clamp01(ctx.astro.systemConfidence),
    })),
    confidence: clamp01(0.5 * ctx.astro.systemConfidence + 0.5 * ctx.vibe.confidence),
  };
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
