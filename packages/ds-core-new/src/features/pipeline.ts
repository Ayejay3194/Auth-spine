import type { FeaturePipeline, Feature } from "./feature.js";
import type { Vector } from "../types.js";

export function makePipeline<Row>(features: Feature<Row>[]): FeaturePipeline<Row> {
  const totalDim = features.reduce((s, f) => s + f.dim, 0);

  return {
    features,
    dim: () => totalDim,
    transform: (row: Row): Vector => {
      const out = new Float64Array(totalDim);
      let offset = 0;
      for (const f of features) {
        const v = f.encode(row);
        out.set(v, offset);
        offset += f.dim;
      }
      return out;
    },
  };
}
