import { Tensor } from "../core/tensor";
import { dAct, MLP } from "../core/nn";
import { Learner, LearnerOptions, LearnerStep } from "./types";

export class FALearner implements Learner {
  name = "FA";

  step(model: MLP, cache: any, dL_dy: Tensor, opts: LearnerOptions): LearnerStep {
    const B = opts.feedback?.B;
    if (!B) throw new Error("FA requires opts.feedback.B (fixed random feedback matrices).");

    const grads = model.layers.map(L => ({
      dW: L.W.clone().mulScalar_(0),
      db: L.b.clone().mulScalar_(0),
    }));

    const Lcount = model.layers.length;

    // output delta
    let delta = dL_dy.hadamard(dAct(cache.z[Lcount - 1], model.layers[Lcount - 1].activation));

    // last layer
    {
      const a_prev = cache.a[Lcount - 1];
      const gate = opts.modulation?.scalar ?? 1;
      grads[Lcount - 1].dW = delta.matmul(a_prev.transpose()).mulScalar_(gate);
      grads[Lcount - 1].db = delta.clone().mulScalar_(gate);
    }

    // hidden layers
    for (let l = Lcount - 2; l >= 0; l--) {
      const z_l = cache.z[l];
      const a_prev = cache.a[l];
      delta = B[l].matmul(delta).hadamard(dAct(z_l, model.layers[l].activation));
      const gate = opts.modulation?.scalar ?? 1;
      grads[l].dW = delta.matmul(a_prev.transpose()).mulScalar_(gate);
      grads[l].db = delta.clone().mulScalar_(gate);
    }

    return { grads, meta: { modulation: opts.modulation?.scalar ?? 1 } };
  }
}
