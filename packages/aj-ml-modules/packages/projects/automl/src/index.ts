import type { Dataset, Predictor } from "@aj/core";
import { runExperiment } from "@aj/pipelines";
import { LinearRegressionGD, LogisticRegression, TinyNN } from "@aj/models";

export async function autoML(ds: Dataset, task: "regression"|"classification") {
  const candidates: Array<{ name: string; model: Predictor }> =
    task === "regression"
      ? [
          { name: "linreg_gd", model: new LinearRegressionGD({ lr: 0.03, epochs: 700 }) },
          { name: "linreg_ridge", model: new LinearRegressionGD({ lr: 0.02, epochs: 900, l2: 1e-3 }) },
        ]
      : [
          { name: "logreg", model: new LogisticRegression({ lr: 0.15, epochs: 700 }) },
          { name: "tinynn", model: new TinyNN({ hidden: 24, epochs: 450 }) },
        ];

  const reports = [];
  for (const c of candidates) {
    const rep = await runExperiment({ name: c.name, task, dataset: ds, model: c.model, seed: 11 });
    reports.push(rep);
  }
  // pick best by metric
  const key = task === "regression" ? "r2" : "accuracy";
  reports.sort((a,b)=> (b.metrics[key] ?? 0) - (a.metrics[key] ?? 0));
  return { best: reports[0], reports };
}
