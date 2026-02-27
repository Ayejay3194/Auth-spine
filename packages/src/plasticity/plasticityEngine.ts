import type { NowContext } from "../types/context.js";
import { MatrixFactory } from "./bioplausible/core/tensor_matrix.js";
import { initMLP } from "./bioplausible/core/nn.js";
import { DFALearner } from "./bioplausible/learners/dfa.js";
import { PredictiveCodingLearner } from "./bioplausible/learners/pc.js";
import { EquilibriumPropLearner } from "./bioplausible/learners/ep.js";
import { trainStep } from "./bioplausible/trainer/trainer.js";
import { contextToFeatures, FEATURE_DIM } from "./features.js";
import { PERSONALIZEABLE_MODULES, moduleIndex, clamp01 } from "./modules.js";

export type PlasticityReport = {
  moduleBias: Record<string, number>;
  confidence: number;
  audit?: Record<string, unknown>;
};

export type PlasticityFeedback = {
  moduleId: string;
  helpful: number; // 0..1
};

export class PlasticityEngine {
  private factory = new MatrixFactory();
  private model = initMLP(this.factory, [FEATURE_DIM, 24, PERSONALIZEABLE_MODULES.length], ["tanh", "linear"], 1337);
  private stepN = 0;

  // DFA needs fixed random feedback matrices per layer
  private B = [
    this.factory.randn([24, PERSONALIZEABLE_MODULES.length], 2001),
    this.factory.randn([PERSONALIZEABLE_MODULES.length, PERSONALIZEABLE_MODULES.length], 2002),
  ];

  private learner = new DFALearner();
  private refine = new PredictiveCodingLearner();
  private auditLearner = new EquilibriumPropLearner();

  /**
   * Predict module biases (0..1) from NowContext.
   */
  public predict(ctx: NowContext): PlasticityReport {
    const x = contextToFeatures(this.factory, ctx);
    const { yHat } = this.model.forward(x);
    const arr = yHat.toFlatArray();

    const bias: Record<string, number> = {};
    for (let i = 0; i < PERSONALIZEABLE_MODULES.length; i++) {
      bias[PERSONALIZEABLE_MODULES[i]] = clamp01(arr[i] ?? 0);
    }

    // Confidence: mostly based on upstream signal confidence.
    const conf = clamp01(0.15 + 0.45 * ctx.vibe.confidence + 0.40 * ctx.astro.systemConfidence);

    return { moduleBias: bias, confidence: conf };
  }

  /**
   * Online update from feedback (click/helpfulness).
   * The target is a sparse vector: selected module gets helpful (0..1), others 0.
   */
  public update(ctx: NowContext, fb: PlasticityFeedback): { loss: number; audit?: Record<string, unknown> } {
    const idx = moduleIndex(fb.moduleId);
    if (idx < 0) return { loss: 0, audit: { skipped: true, reason: "module_not_personalizeable" } };

    const x = contextToFeatures(this.factory, ctx);

    const target = new Array(PERSONALIZEABLE_MODULES.length).fill(0);
    target[idx] = clamp01(fb.helpful);
    const y = this.factory.fromFlatArray(target, [PERSONALIZEABLE_MODULES.length, 1]);

    // Modulation: learn faster when both signal confidences are high.
    const modulation = clamp01(0.25 + 0.75 * Math.min(ctx.vibe.confidence, ctx.astro.systemConfidence));

    const res = trainStep(this.factory, this.model, { x, y }, {
      learner: this.learner,
      learnerOpts: { lr: 0.015, feedback: { B: this.B }, modulation: { scalar: modulation } },
      refine: { every: 8, learner: this.refine, opts: { lr: 0.006, settle: { T: 10, alpha: 0.25 } } },
      audit: { every: 32, learner: this.auditLearner, opts: { lr: 0.0, settle: { T: 20, alpha: 0.25, beta: 0.08 } } },
    }, this.stepN);

    this.stepN++;
    return res;
  }
}
