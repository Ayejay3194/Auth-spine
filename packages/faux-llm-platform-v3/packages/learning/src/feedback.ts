export type Feedback = { sessionId: string; turnId: string; score: -1 | 0 | 1; note?: string };

export function rewardFromFeedback(fb: Feedback): number {
  // Map to a mild reward scale to avoid violent oscillations.
  if (fb.score === 1) return 1.0;
  if (fb.score === -1) return -1.0;
  return 0.0;
}
