import { describe } from "@aj/core";

export function runEDA(ds: { X: number[][]; featureNames?: string[] }) {
  return describe({ X: ds.X, featureNames: ds.featureNames });
}
