import type { VibeNowSignals, VibeCue } from "../types/vibe.js";
import type { VibeFeatures } from "./features.js";
import { clamp } from "../utils/math.js";

export type VibeStateInternal = {
  arousal: number;
  warmth: number;
  defensiveness: number;
  coherence: number;
  dominance: number;
  volatility: number;
  confidence: number;
  lastUtc: string;
};

export const DEFAULT_VIBE: VibeStateInternal = {
  arousal: 0.35,
  warmth: 0.55,
  defensiveness: 0.30,
  coherence: 0.70,
  dominance: 0.50,
  volatility: 0.10,
  confidence: 0.10,
  lastUtc: new Date(0).toISOString()
};

function ewma(prev: number, x: number, alpha: number): number {
  return (1 - alpha) * prev + alpha * x;
}

export function updateVibeState(prev: VibeStateInternal, utc: string, feats: VibeFeatures): { state: VibeStateInternal; signals: VibeNowSignals } {
  // Map features to rough scores (0..1). Keep deterministic and bounded.
  const arousalObs =
    clamp(0.25 + 0.6*feats.exclamRate + 0.3*feats.intensifierRate + 0.2*feats.questionRate + 0.25*feats.topicDrift, 0, 1);

  const warmthObs =
    clamp(0.55 - 0.25*feats.negationRate - 0.25*feats.shortReplyRate + 0.15*(1 - feats.topicDrift), 0, 1);

  const defensivenessObs =
    clamp(0.20 + 0.45*feats.negationRate + 0.35*feats.shortReplyRate + 0.15*feats.topicDrift, 0, 1);

  const coherenceObs =
    clamp(0.80 - 0.50*feats.topicDrift - 0.15*feats.exclamRate, 0, 1);

  // Dominance is more meaningful in group chats; we proxy with questionRate vs statement length.
  const dominanceObs =
    clamp(0.50 + 0.15*(feats.avgLen/200) - 0.10*feats.questionRate, 0, 1);

  const alpha = clamp(0.15 + feats.msgCount/40, 0.15, 0.45);

  const arousal = ewma(prev.arousal, arousalObs, alpha);
  const warmth = ewma(prev.warmth, warmthObs, alpha);
  const defensiveness = ewma(prev.defensiveness, defensivenessObs, alpha);
  const coherence = ewma(prev.coherence, coherenceObs, alpha);
  const dominance = ewma(prev.dominance, dominanceObs, alpha);

  // Volatility as average absolute change
  const d = (Math.abs(arousal - prev.arousal) + Math.abs(defensiveness - prev.defensiveness) + Math.abs(warmth - prev.warmth))/3;
  const volatility = ewma(prev.volatility, clamp(d*3, 0, 1), 0.25);

  const confObs = clamp((feats.msgCount / 10) * 0.7 + (feats.latencyAvgMs ? 0.2 : 0) + 0.1, 0, 1);
  const confidence = ewma(prev.confidence, confObs, 0.2);

  const cues: VibeCue[] = [];
  if (feats.shortReplyRate > 0.45) cues.push("short_replies");
  if (feats.latencyAvgMs !== null && feats.latencyAvgMs > 2500) cues.push("latency_spike");
  if (feats.exclamRate > 0.30) cues.push("punctuation_burst");
  if (feats.questionRate > 0.45) cues.push("question_burst");
  if (feats.negationRate > 0.9) cues.push("negation_burst");
  if (feats.intensifierRate > 0.9) cues.push("intensifier_burst");
  if (feats.topicDrift > 0.65) cues.push("topic_drift");

  const state: VibeStateInternal = { arousal, warmth, defensiveness, coherence, dominance, volatility, confidence, lastUtc: utc };

  const signals: VibeNowSignals = { utc, arousal, warmth, defensiveness, coherence, dominance, volatility, confidence, cues };
  return { state, signals };
}
