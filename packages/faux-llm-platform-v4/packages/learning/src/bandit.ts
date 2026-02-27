/**
 * RL-lite bandit for choosing between strategies:
 * - prompt variants
 * - model variants
 * - retrieval settings
 *
 * This learns from explicit feedback or proxy rewards.
 */
export interface ArmStats { pulls: number; rewardSum: number; }
export interface BanditState { arms: Record<string, ArmStats>; }

export interface BanditConfig {
  epsilon: number; // explore probability
}

export function selectArm(state: BanditState, arms: string[], cfg: BanditConfig, rng = Math.random): string {
  if (arms.length === 0) throw new Error("no_arms");
  if (rng() < cfg.epsilon) return arms[Math.floor(rng() * arms.length)]!;
  let best = arms[0]!;
  let bestMean = -Infinity;
  for (const a of arms) {
    const s = state.arms[a];
    const mean = s && s.pulls > 0 ? (s.rewardSum / s.pulls) : 0;
    if (mean > bestMean) { bestMean = mean; best = a; }
  }
  return best;
}

export function updateArm(state: BanditState, arm: string, reward: number): void {
  const s = state.arms[arm] ?? { pulls: 0, rewardSum: 0 };
  s.pulls += 1;
  s.rewardSum += reward;
  state.arms[arm] = s;
}
