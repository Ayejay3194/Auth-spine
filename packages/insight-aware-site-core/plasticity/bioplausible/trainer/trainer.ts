import { Tensor, TensorFactory } from "../core/tensor.js";
import { lossAndGrad, MLP } from "../core/nn.js";
import { Learner, LearnerOptions, LearnerStep } from "../learners/types.js";

export interface Batch {
  x: Tensor;
  y: Tensor;
}

export interface TrainConfig {
  learner: Learner;
  learnerOpts: LearnerOptions;

  refine?: {
    every: number;
    learner: Learner;
    opts: LearnerOptions;
  };

  audit?: {
    every: number;
    learner: Learner;
    opts: LearnerOptions;
  };
}

function cosine(a: Tensor, b: Tensor): number {
  const denom = a.norm2() * b.norm2();
  if (denom === 0) return 0;
  return a.dot(b) / denom;
}

export function flattenGrads(factory: TensorFactory, step: LearnerStep): Tensor {
  const parts: Tensor[] = [];
  for (const g of step.grads) {
    parts.push(g.dW, g.db);
  }
  return factory.concatFlatten(parts);
}

export function applyGrads(model: MLP, step: LearnerStep, lr: number): void {
  for (let l = 0; l < model.layers.length; l++) {
    model.layers[l].W.sub_(step.grads[l].dW.clone().mulScalar_(lr));
    model.layers[l].b.sub_(step.grads[l].db.clone().mulScalar_(lr));
  }
}

export function trainStep(factory: TensorFactory, model: MLP, batch: Batch, cfg: TrainConfig, globalStep: number): {
  loss: number;
  audit?: Record<string, unknown>;
} {
  const { yHat, cache } = model.forward(batch.x);
  const { loss, grad } = lossAndGrad(yHat, batch.y, "mse");

  const mainStep = cfg.learner.step(model, cache, grad, cfg.learnerOpts);
  applyGrads(model, mainStep, cfg.learnerOpts.lr);

  if (cfg.refine && globalStep % cfg.refine.every === 0) {
    const refineStep = cfg.refine.learner.step(model, cache, grad, cfg.refine.opts);
    applyGrads(model, refineStep, cfg.refine.opts.lr);
  }

  let audit: Record<string, unknown> | undefined;
  if (cfg.audit && globalStep % cfg.audit.every === 0) {
    const auditStep = cfg.audit.learner.step(model, cache, grad, cfg.audit.opts);

    const gMain = flattenGrads(factory, mainStep);
    const gAudit = flattenGrads(factory, auditStep);
    const cos = cosine(gMain, gAudit);

    audit = {
      auditLearner: cfg.audit.learner.name,
      cosineSimilarity: cos,
      hint:
        cos < 0.2
          ? "Main learner update direction is drifting vs EP. Consider lowering lr, increasing PC refine frequency, or increasing settle T."
          : "Update directions roughly agree (good enough).",
    };
  }

  return { loss, audit };
}
