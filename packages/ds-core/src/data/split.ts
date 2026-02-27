import type { Dataset, RNG } from "../types.js";

export interface SplitOptions {
  testRatio: number; // 0..1
  seed?: number;
}

export function mulberry32(seed: number): RNG {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleInPlace<T>(arr: T[], rng: RNG): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

export function trainTestSplit<Row, Y>(
  ds: Dataset<Row, Y>,
  opts: SplitOptions
): { train: Dataset<Row, Y>; test: Dataset<Row, Y> } {
  if (opts.testRatio <= 0 || opts.testRatio >= 1) {
    throw new Error("testRatio must be in (0,1)");
  }

  const rng = mulberry32(opts.seed ?? 42);
  const idx = ds.instances.map((_, i) => i);
  shuffleInPlace(idx, rng);

  const cut = Math.floor(idx.length * (1 - opts.testRatio));
  const trainIdx = idx.slice(0, cut);
  const testIdx = idx.slice(cut);

  const train: Dataset<Row, Y> = {
    ...ds,
    name: `${ds.name}-train`,
    instances: trainIdx.map((i) => ds.instances[i]!),
  };

  const test: Dataset<Row, Y> = {
    ...ds,
    name: `${ds.name}-test`,
    instances: testIdx.map((i) => ds.instances[i]!),
  };

  return { train, test };
}
