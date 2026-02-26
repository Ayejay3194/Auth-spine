import type { Module } from "./moduleTypes.js";
import { clamp } from "../utils/math.js";

export const GroupDynamics: Module = (ctx) => {
  // Placeholder: this becomes real when you pass multi-speaker events and compute turn-taking.
  const dom = ctx.vibe.dominance;
  const warm = ctx.vibe.warmth;
  const def = ctx.vibe.defensiveness;

  const pattern =
    dom > 0.62 && warm < 0.50 ? "Command-and-control vibe. People comply, then quietly resent." :
    dom < 0.45 && def > 0.55 ? "Withdraw/ghost loop risk. Silence becomes a weapon." :
    warm > 0.62 && def < 0.45 ? "Repair-friendly room. Say the honest thing while it's safe." :
    "Mixed signals. Keep statements short, ask clean questions.";

  const conf = clamp(0.35 + 0.65*ctx.vibe.confidence, 0, 1);

  return {
    id: "GroupDynamics",
    title: "Group Dynamics",
    summary: "Interaction forecast from observable conversation signals.",
    bullets: [
      pattern,
      "Move: state intent, then ask one question that can't be dodged."
    ],
    receipts: ctx.user.preferences.receiptsDefault ? [
      `Dominance ${dom.toFixed(2)} | Warmth ${warm.toFixed(2)} | Defensiveness ${def.toFixed(2)}`
    ] : undefined,
    confidence: conf
  };
};
