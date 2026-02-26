import type { NowContext } from "../types/context.js";
import { PERSONALIZEABLE_MODULES } from "./modules.js";

/**
 * Reorders ctx.routing.suggestedModules by combining heuristic order with plasticity biases.
 * This is intentionally conservative: it only reorders within the suggested set.
 */
export function applyPlasticityToRouting(ctx: NowContext): NowContext {
  if (!ctx.plasticity) return ctx;

  const bias = ctx.plasticity.moduleBias;
  const suggested = ctx.routing.suggestedModules.slice();

  suggested.sort((a, b) => {
    const ba = bias[a] ?? 0;
    const bb = bias[b] ?? 0;

    // Keep non-personalizeable modules stable.
    const aIs = PERSONALIZEABLE_MODULES.includes(a as any);
    const bIs = PERSONALIZEABLE_MODULES.includes(b as any);
    if (!aIs && !bIs) return 0;
    if (aIs && !bIs) return -1;
    if (!aIs && bIs) return 1;

    // Higher bias first
    return (bb - ba);
  });

  return {
    ...ctx,
    routing: {
      ...ctx.routing,
      suggestedModules: suggested,
      riskFlags: ctx.routing.riskFlags.concat(ctx.plasticity.confidence < 0.45 ? ["plasticity_low_confidence"] : []),
    }
  };
}
