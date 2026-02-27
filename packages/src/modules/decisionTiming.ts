import type { Module } from "./moduleTypes.js";
import { clamp } from "../utils/math.js";

export const DecisionTiming: Module = (ctx) => {
  const hard = ctx.astro.topAspects.filter(a => a.type === "SQR" || a.type === "OPP" || a.type === "SESQ");
  const soft = ctx.astro.topAspects.filter(a => a.type === "TRI" || a.type === "SEX");

  const risk = clamp((hard.reduce((s,a)=>s+a.strength,0) / Math.max(1, hard.length)) * 0.8 + ctx.vibe.volatility*0.2, 0, 1);
  const green = clamp((soft.reduce((s,a)=>s+a.strength,0) / Math.max(1, soft.length)) * 0.7 + ctx.vibe.warmth*0.3, 0, 1);

  const bullets: string[] = [];
  bullets.push(`Risk index: ${risk.toFixed(2)} | Green index: ${green.toFixed(2)}`);

  if (risk > 0.62) bullets.push("Avoid: irreversible decisions, ultimatums, high-stakes texting.");
  else bullets.push("Okay: small decisions, scheduling, low-stakes outreach.");

  if (green > 0.62) bullets.push("Good for: collaboration, repair conversations, creative output.");
  else bullets.push("Good for: cleanup, planning, quiet progress.");

  const conf = clamp((ctx.astro.systemConfidence*0.7 + ctx.vibe.confidence*0.3), 0, 1);

  return {
    id: "DecisionTiming",
    title: "Decision Timing",
    summary: "What to push vs pause (timing, not fate).",
    bullets,
    receipts: ctx.user.preferences.receiptsDefault ? ctx.astro.topAspects.slice(0,5).map(a => `${a.a} ${a.type} ${a.b} | orb ${a.orbDeg.toFixed(2)}°`) : undefined,
    confidence: conf,
    cta: { label: "Open Group Dynamics", href: "/modules/GroupDynamics" }
  };
};
