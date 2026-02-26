import { Tensor } from "../core/tensor.js";
import { dAct, MLP } from "../core/nn.js";
import { Learner, LearnerOptions, LearnerStep } from "./types.js";

export class DFALearner implements Learner {
  name = "DFA";

  step(model: MLP, cache: any, dL_dy: Tensor, opts: LearnerOptions): LearnerStep {
    const B = opts.feedback?.B;
    if (!B) throw new Error("DFA requires opts.feedback.B (fixed random feedback matrices).");

    const grads = model.layers.map(L => ({
      dW: L.W.clone().mulScalar_(0),
      db: L.b.clone().mulScalar_(0),
    }));

    for (let l = 0; l < model.layers.length; l++) {
      const z_l = cache.z[l];
      const a_prev = cache.a[l];

      const proj = B[l].matmul(dL_dy); // [layer_out,1]
      const delta = proj.hadamard(dAct(z_l, model.layers[l].activation));

      const gate = opts.modulation?.scalar ?? 1;

      grads[l].dW = delta.matmul(a_prev.transpose()).mulScalar_(gate);
      grads[l].db = delta.clone().mulScalar_(gate);
    }

    return { grads, meta: { modulation: opts.modulation?.scalar ?? 1 } };
  }
}
