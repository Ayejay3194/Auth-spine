export type VibeCue =
  | "short_replies"
  | "latency_spike"
  | "punctuation_burst"
  | "question_burst"
  | "negation_burst"
  | "intensifier_burst"
  | "topic_drift"
  | "dominance_shift";

export type VibeNowSignals = {
  utc: string;
  arousal: number;       // 0..1
  warmth: number;        // 0..1
  defensiveness: number; // 0..1
  coherence: number;     // 0..1
  dominance: number;     // 0..1
  volatility: number;    // 0..1
  confidence: number;    // 0..1
  cues: VibeCue[];
};
