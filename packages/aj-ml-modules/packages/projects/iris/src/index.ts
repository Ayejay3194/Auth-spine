import { StandardScaler, trainTestSplit, accuracy } from "@aj/core";
import { LogisticRegression } from "@aj/models";
import { X, y, featureNames } from "./irisData";

export function trainIris() {
  const scaler = new StandardScaler();
  scaler.fit(X);
  const Xs = scaler.transform(X);
  const split = trainTestSplit({ X: Xs, y, featureNames }, 0.33, 7);

  const clf = new LogisticRegression({ lr: 0.2, epochs: 600 });
  clf.fit(split.train.X, split.train.y!);
  const pred = clf.predict(split.test.X);
  return { accuracy: accuracy(split.test.y!, pred), featureNames };
}
