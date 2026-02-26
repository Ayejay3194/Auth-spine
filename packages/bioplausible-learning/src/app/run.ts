import { MatrixFactory } from "../core/tensor_matrix";
import { initMLP } from "../core/nn";
import { DFALearner } from "../learners/dfa";
import { PredictiveCodingLearner } from "../learners/pc";
import { EquilibriumPropLearner } from "../learners/ep";
import { trainStep } from "../trainer/trainer";

type Batch = { x: any; y: any };

function makeSyntheticData(factory: MatrixFactory, nBatches: number): Batch[] {
  // Simple linear teacher: y = A x + noise; encourages learning without being too hard.
  const input = 16, output = 8;
  const A = factory.randn([output, input], 777);

  const data: Batch[] = [];
  for (let k = 0; k < nBatches; k++) {
    const x = factory.randn([input, 1], 10000 + k);
    const y = (A as any).matmul(x).add_(factory.randn([output, 1], 20000 + k).mulScalar_(0.05));
    data.push({ x, y });
  }
  return data;
}

function buildHybrid(factory: MatrixFactory) {
  const model = initMLP(factory, [16, 64, 64, 8], ["relu", "relu", "linear"], 42);

  // Fixed random feedback matrices for DFA:
  // B[l] maps output_error (8x1) -> layer_out (sizes[l+1]x1)
  const B = [
    factory.randn([64, 8], 1001),
    factory.randn([64, 8], 1002),
    factory.randn([8, 8], 1003),
  ];

  const cfg = {
    learner: new DFALearner(),
    learnerOpts: {
      lr: 1e-3,
      feedback: { B },
      modulation: { scalar: 1.0 },
    },

    refine: {
      every: 10,
      learner: new PredictiveCodingLearner(),
      opts: {
        lr: 2e-4,
        modulation: { scalar: 0.7 },
        settle: { T: 5, alpha: 0.15 },
      },
    },

    audit: {
      every: 200,
      learner: new EquilibriumPropLearner(),
      opts: {
        lr: 0, // audit only
        settle: { T: 8, alpha: 0.10, beta: 1e-2 },
      },
    },
  } as const;

  return { model, cfg };
}

export function main() {
  const factory = new MatrixFactory();
  const data = makeSyntheticData(factory, 2000);

  const { model, cfg } = buildHybrid(factory);

  for (let step = 0; step < data.length; step++) {
    const res = trainStep(factory, model, data[step], cfg as any, step);
    if (step % 25 === 0) {
      const audit = res.audit ? ` audit=${JSON.stringify(res.audit)}` : "";
      console.log(`step=${step} loss=${res.loss.toFixed(4)}${audit}`);
    }
  }
}

main();
