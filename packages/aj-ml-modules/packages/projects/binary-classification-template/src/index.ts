import { StandardScaler, trainTestSplit, accuracy } from "@aj/core";
import { TinyNN, LogisticRegression } from "@aj/models";

export interface BinaryDataset { X: number[][]; y: number[]; featureNames?: string[]; }

export function trainBinary(ds: BinaryDataset, model: "logreg"|"tinynn"="logreg") {
  const scaler = new StandardScaler();
  scaler.fit(ds.X);
  const Xs = scaler.transform(ds.X);
  const split = trainTestSplit({ X: Xs, y: ds.y, featureNames: ds.featureNames }, 0.2, 42);

  const clf = model === "tinynn" ? new TinyNN({ hidden: 24, epochs: 500 }) : new LogisticRegression({ lr: 0.15, epochs: 800 });
  clf.fit(split.train.X, split.train.y!);
  const pred = clf.predict(split.test.X);
  return { accuracy: accuracy(split.test.y!, pred) };
}
