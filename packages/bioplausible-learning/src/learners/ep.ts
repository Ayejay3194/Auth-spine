import { Tensor } from "../core/tensor";
import { act, MLP } from "../core/nn";
import { Learner, LearnerOptions, LearnerStep } from "./types";

function relax(model: MLP, a0: Tensor[], T: number, alpha: number): Tensor[] {
  const a = a0.map(t => t.clone());
  for (let t = 0; t < T; t++) {
    for (let l = 0; l < model.layers.length; l++) {
      const L = model.layers[l];
      const pred = act(L.W.matmul(a[l]).add_(L.b), L.activation);
      const err = a[l + 1].clone().sub_(pred);
      a[l + 1].sub_(err.mulScalar_(alpha));
    }
  }
  return a;
}

export class EquilibriumPropLearner implements Learner {
  name = "EquilibriumProp";

  step(model: MLP, cache: any, dL_dy: Tensor, opts: LearnerOptions): LearnerStep {
    const settle = opts.settle;
    if (!settle?.beta) throw new Error("EP requires opts.settle {T, alpha, beta}.");

    const { T, alpha, beta } = settle;

    const a_free = relax(model, cache.a, T, alpha);

    const a_nudge_seed = a_free.map(t => t.clone());
    const outIdx = a_nudge_seed.length - 1;
    a_nudge_seed[outIdx].sub_(dL_dy.clone().mulScalar_(beta));

    const a_beta = relax(model, a_nudge_seed, T, alpha);

    const grads = model.layers.map(L => ({
      dW: L.W.clone().mulScalar_(0),
      db: L.b.clone().mulScalar_(0),
    }));

    for (let l = 0; l < model.layers.length; l++) {
      const outer_beta = a_beta[l + 1].matmul(a_beta[l].transpose());
      const outer_free = a_free[l + 1].matmul(a_free[l].transpose());
      const dW = outer_beta.sub_(outer_free).mulScalar_(1 / beta);

      const db = a_beta[l + 1].clone().sub_(a_free[l + 1]).mulScalar_(1 / beta);

      grads[l].dW = dW;
      grads[l].db = db;
    }

    return { grads, meta: { T, alpha, beta } };
  }
}
