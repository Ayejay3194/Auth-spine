import type { Dataset } from "../types.js";
import { trainTestSplit } from "../data/split.js";

/**
 * Pragmatic k-fold: repeated random splits (seeded).
 * Great for quick iteration; for strict k-fold indexing, implement deterministic fold assignments.
 */
export async function kFold<Row, Y>(
  ds: Dataset<Row, Y>,
  k: number,
  seed: number,
  runFold: (train: Dataset<Row, Y>, test: Dataset<Row, Y>, fold: number) => Promise<Record<string, number>>
): Promise<Record<string, number[]>> {
  if (k <= 1) throw new Error("k must be > 1");
  const results: Record<string, number[]> = {};

  for (let fold = 0; fold < k; fold++) {
    const { train, test } = trainTestSplit(ds, { testRatio: 1 / k, seed: seed + fold });
    const metrics = await runFold(train, test, fold);
    for (const [key, val] of Object.entries(metrics)) (results[key] ??= []).push(val);
  }

  return results;
}
