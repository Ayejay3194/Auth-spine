import { Tensor } from "../core/tensor.js";
import { act, MLP } from "../core/nn.js";
import { Learner, LearnerOptions, LearnerStep } from "./types.js";

export class PredictiveCodingLearner implements Learner {
  name = "PredictiveCoding";

  step(model: MLP, cache: any, dL_dy: Tensor, opts: LearnerOptions): LearnerStep {
    const settle = opts.settle;
    if (!settle) throw new Error("PC requires opts.settle {T, alpha}.");

    const { T, alpha } = settle;

    // copy activations
    const a = cache.a.map((t: Tensor) => t.clone());

    // "target" at output: a_out <- a_out - alpha * dL/dy
    const outIdx = a.length - 1;
    a[outIdx].sub_(dL_dy.clone().mulScalar_(alpha));

    // iterative settling
    for (let t = 0; t < T; t++) {
      for (let l = 0; l < model.layers.length; l++) {
        const L = model.layers[l];
        const pred = act(L.W.matmul(a[l]).add_(L.b), L.activation);
        const err = a[l + 1].clone().sub_(pred);
        // a[l+1] <- a[l+1] - alpha * err
        a[l + 1].sub_(err.mulScalar_(alpha));
      }
    }

    // local learning after settling
    const grads = model.layers.map(L => ({
      dW: L.W.clone().mulScalar_(0),
      db: L.b.clone().mulScalar_(0),
    }));

    for (let l = 0; l < model.layers.length; l++) {
      const L = model.layers[l];
      const pred = act(L.W.matmul(a[l]).add_(L.b), L.activation);
      const err = a[l + 1].clone().sub_(pred); // epsilon^{l+1}

      const gate = opts.modulation?.scalar ?? 1;
      grads[l].dW = err.matmul(a[l].transpose()).mulScalar_(gate);
      grads[l].db = err.clone().mulScalar_(gate);
    }

    return { grads, meta: { T, alpha, modulation: opts.modulation?.scalar ?? 1 } };
  }
}
