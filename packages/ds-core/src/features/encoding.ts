import type { Vector } from "../types.js";
import type { Feature } from "./feature.js";

/** One-hot encode a categorical string with a fixed vocabulary. */
export function oneHot<Row>(
  name: string,
  get: (row: Row) => string,
  vocab: readonly string[]
): Feature<Row> {
  const index = new Map<string, number>();
  vocab.forEach((v, i) => index.set(v, i));

  return {
    name,
    dim: vocab.length,
    encode: (row: Row): Vector => {
      const out = new Float64Array(vocab.length);
      const v = get(row);
      const i = index.get(v);
      if (i !== undefined) out[i] = 1;
      return out;
    },
  };
}

/** Numeric scalar feature */
export function scalar<Row>(name: string, get: (row: Row) => number): Feature<Row> {
  return {
    name,
    dim: 1,
    encode: (row) => new Float64Array([get(row)]),
  };
}

/** Bounded numeric scalar feature (clamps to [min,max]) */
export function bounded<Row>(
  name: string,
  get: (row: Row) => number,
  min: number,
  max: number
): Feature<Row> {
  return {
    name,
    dim: 1,
    encode: (row) => {
      const v = get(row);
      const c = Math.min(max, Math.max(min, v));
      return new Float64Array([c]);
    },
  };
}
