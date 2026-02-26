/**
 * Contextual bandit (epsilon-greedy) for exploration on feeds/recs.
 * This is the safe "RL-lite" you actually want before full RL.
 */

export interface ArmStats {
  pulls: number;
  rewardSum: number;
}

export interface BanditState {
  arms: Record<string, ArmStats>;
}

export interface BanditConfig {
  epsilon: number; // exploration prob
}

export function selectArm(state: BanditState, candidates: string[], cfg: BanditConfig, rng = Math.random): string {
  if (candidates.length === 0) throw new Error("no_candidates");
  const explore = rng() < cfg.epsilon;
  if (explore) return candidates[Math.floor(rng() * candidates.length)]!;

  let best = candidates[0]!;
  let bestMean = -Infinity;

  for (const id of candidates) {
    const s = state.arms[id];
    const mean = s && s.pulls > 0 ? (s.rewardSum / s.pulls) : 0;
    if (mean > bestMean) { bestMean = mean; best = id; }
  }
  return best;
}

export function updateArm(state: BanditState, armId: string, reward: number): void {
  const s = state.arms[armId] ?? { pulls: 0, rewardSum: 0 };
  s.pulls += 1;
  s.rewardSum += reward;
  state.arms[armId] = s;
}
