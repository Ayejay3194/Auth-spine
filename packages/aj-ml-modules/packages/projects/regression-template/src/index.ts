import { StandardScaler, trainTestSplit, mse, r2 } from "@aj/core";
import { LinearRegressionGD } from "@aj/models";

export interface RegressionDataset { X: number[][]; y: number[]; featureNames?: string[]; }

export function trainRegression(ds: RegressionDataset) {
  const scaler = new StandardScaler();
  scaler.fit(ds.X);
  const Xs = scaler.transform(ds.X);
  const split = trainTestSplit({ X: Xs, y: ds.y, featureNames: ds.featureNames }, 0.2, 9);

  const m = new LinearRegressionGD({ lr: 0.03, epochs: 900, l2: 1e-4 });
  m.fit(split.train.X, split.train.y!);
  const pred = m.predict(split.test.X);
  return { mse: mse(split.test.y!, pred), r2: r2(split.test.y!, pred), params: m.params() };
}
