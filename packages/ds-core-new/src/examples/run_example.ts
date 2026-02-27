import { makePipeline } from "../features/pipeline.js";
import { scalar, oneHot } from "../features/encoding.js";
import { StandardScaler } from "../features/scaling.js";
import { trainTestSplit } from "../data/split.js";
import { LinearRegression } from "../models/linear_regression.js";
import { LogisticRegression } from "../models/logistic_regression.js";
import { mse, accuracy, logLoss, rocAuc, brierScore } from "../validation/metrics.js";
import { InMemoryTracker } from "../experiments/tracker.js";

type Row = { age: number; clicks7d: number; segment: "A" | "B" | "C" };

const pipeline = makePipeline<Row>([
  scalar("age", r => r.age),
  scalar("clicks7d", r => r.clicks7d),
  oneHot("segment", r => r.segment, ["A", "B", "C"] as const),
]);

const regression = {
  name: "toy-regression",
  task: "regression" as const,
  instances: Array.from({ length: 120 }, (_, i) => {
    const age = 18 + (i % 40);
    const clicks7d = (i * 7) % 30;
    const segment = (["A", "B", "C"] as const)[i % 3]!;
    const y = 0.02 * age + 0.08 * clicks7d + (segment === "B" ? 0.8 : 0) + (segment === "C" ? -0.4 : 0);
    return { id: String(i), x: { age, clicks7d, segment }, y };
  }),
};

const classification = {
  name: "toy-binary",
  task: "binary_classification" as const,
  instances: Array.from({ length: 160 }, (_, i) => {
    const age = 18 + (i % 45);
    const clicks7d = (i * 11) % 30;
    const segment = (["A", "B", "C"] as const)[i % 3]!;
    const score = -3 + 0.04 * age + 0.12 * clicks7d + (segment === "A" ? 0.2 : 0) + (segment === "B" ? 0.6 : -0.1);
    const p = 1 / (1 + Math.exp(-score));
    const y = (Math.random() < p ? 1 : 0);
    return { id: `c${i}`, x: { age, clicks7d, segment }, y };
  }),
};

function buildXY(ds: any) {
  const X = ds.instances.map((i: any) => pipeline.transform(i.x));
  const y = ds.instances.map((i: any) => i.y as number);
  return { X, y };
}

async function main() {
  // Regression
  const { train: rTrain, test: rTest } = trainTestSplit(regression, { testRatio: 0.2, seed: 7 });
  const rXYtr = buildXY(rTrain);
  const rXYte = buildXY(rTest);

  const scaler = new StandardScaler().fit(rXYtr.X);
  const Xtr = scaler.transform(rXYtr.X);
  const Xte = scaler.transform(rXYte.X);

  const lr = new LinearRegression(pipeline.dim(), { l2: 1e-3 });
  lr.fit(Xtr, rXYtr.y, { epochs: 250, batchSize: 16, learningRate: 0.05, verbose: false });

  const rPred = lr.predict(Xte);
  console.log("Regression MSE:", mse(rXYte.y, rPred).toFixed(5));

  // Classification
  const { train: cTrain, test: cTest } = trainTestSplit(classification, { testRatio: 0.2, seed: 9 });
  const cXYtr = buildXY(cTrain);
  const cXYte = buildXY(cTest);

  const cScaler = new StandardScaler().fit(cXYtr.X);
  const cXtr = cScaler.transform(cXYtr.X);
  const cXte = cScaler.transform(cXYte.X);

  const logreg = new LogisticRegression(pipeline.dim(), { l2: 1e-3 });
  logreg.fit(cXtr, cXYtr.y, { epochs: 300, batchSize: 20, learningRate: 0.08, verbose: false });

  const cProb = logreg.predictProba(cXte);
  const cPred = cProb.map(p => (p >= 0.5 ? 1 : 0));

  console.log("Cls Accuracy:", accuracy(cXYte.y, cPred).toFixed(5));
  console.log("Cls LogLoss:", logLoss(cXYte.y, cProb).toFixed(5));
  console.log("Cls AUC:", rocAuc(cXYte.y, cProb).toFixed(5));
  console.log("Cls Brier:", brierScore(cXYte.y, cProb).toFixed(5));

  // Experiment tracking
  const tracker = new InMemoryTracker();
  const run = tracker.start("toy-run", { dim: pipeline.dim(), model: logreg.name, l2: 1e-3 });
  tracker.logMetric(run, "accuracy", accuracy(cXYte.y, cPred));
  tracker.logMetric(run, "logloss", logLoss(cXYte.y, cProb));
  tracker.logMetric(run, "auc", rocAuc(cXYte.y, cProb));
  console.log("Run:", run);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
