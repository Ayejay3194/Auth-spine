import { Tensor } from "../core/tensor";
import { ForwardCache, MLP } from "../core/nn";

export interface GradLayer {
  dW: Tensor;
  db: Tensor;
}

export interface LearnerStep {
  grads: GradLayer[];
  meta?: Record<string, unknown>;
}

export interface Learner {
  name: string;
  step(model: MLP, cache: ForwardCache, dL_dy: Tensor, opts: LearnerOptions): LearnerStep;
}

export interface LearnerOptions {
  lr: number;

  feedback?: {
    B: Tensor[]; // FA: B[l] maps delta_{l+1} -> delta_l; DFA: B[l] maps output_error -> delta_l
  };

  modulation?: {
    scalar: number; // 3-factor gate: reward/novelty/confidence
  };

  settle?: {
    T: number;
    alpha: number;
    beta?: number; // EP nudging strength
  };
}
