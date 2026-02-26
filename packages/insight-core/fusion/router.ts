import type { NowContext } from "../types/context.js";

export function routeModules(ctx: NowContext): NowContext["routing"] {
  const mods: string[] = ["TodaySnapshot", "PressureWindow"];
  const risk: string[] = [];

  if (ctx.vibe.confidence < 0.35) risk.push("low_confidence_vibe");
  if (ctx.astro.systemConfidence < 0.65) risk.push("low_confidence_astro");

  // Simple heuristics for suggestions
  if (ctx.vibe.defensiveness > 0.58) mods.push("DefenseStyle");
  if (ctx.vibe.warmth < 0.45 && ctx.vibe.defensiveness > 0.50) mods.push("RepairScript");
  if (ctx.astro.topAspects.some(a => a.type === "SQR" || a.type === "OPP")) mods.push("DecisionTiming");
  if (ctx.vibe.dominance > 0.62) mods.push("GroupDynamics");

  // Deduplicate
  const uniq = Array.from(new Set(mods));
  return { suggestedModules: uniq, riskFlags: risk };
}
