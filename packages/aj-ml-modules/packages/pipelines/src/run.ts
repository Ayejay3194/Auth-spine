import type { Dataset, Predictor } from "@aj/core";
import { trainTestSplit } from "@aj/core";
import { accuracy, mse, r2 } from "@aj/core";

export type Task = "classification" | "regression";

export async function runExperiment(args: {
  name: string;
  task: Task;
  dataset: Dataset;
  model: Predictor;
  testRatio?: number;
  seed?: number;
}) {
  const split = trainTestSplit(args.dataset, args.testRatio ?? 0.2, args.seed ?? 42);
  if (!split.train.y || !split.test.y) throw new Error("Dataset needs y");
  await args.model.fit(split.train.X, split.train.y);
  const pred = args.model.predict(split.test.X);

  const report: any = { name: args.name, task: args.task, nTrain: split.train.X.length, nTest: split.test.X.length };
  if (args.task === "classification") report.metrics = { accuracy: accuracy(split.test.y, pred) };
  else report.metrics = { mse: mse(split.test.y, pred), r2: r2(split.test.y, pred) };
  return report;
}
