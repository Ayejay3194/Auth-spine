import type { Model, ModelMeta, Prediction } from "@aj/ml-core";
import type { Residual } from "./types";

export interface ResidualModel extends Model<{ x: readonly number[] }, Residual> {}

/** Simple auditable linear fallback. */
export interface LinearResidualWeights {
  wLon: readonly number[];
  bLon: number;
  wLat: readonly number[];
  bLat: number;
}

export class LinearResidualModel implements ResidualModel {
  constructor(public meta: ModelMeta, private weights: LinearResidualWeights) {}
  predict(input: { x: readonly number[] }): Prediction<Residual> {
    const dot = (w: readonly number[], x: readonly number[]) => {
      let s = 0;
      const n = Math.min(w.length, x.length);
      for (let i = 0; i < n; i++) s += (w[i] ?? 0) * (x[i] ?? 0);
      return s;
    };
    return {
      value: {
        dLonArcsec: dot(this.weights.wLon, input.x) + this.weights.bLon,
        dLatArcsec: dot(this.weights.wLat, input.x) + this.weights.bLat
      },
      confidence: 0.6
    };
  }
}

/** Stub for exported tree/GBDT models. Implement deterministic traversal when ready. */
export class GbdtResidualModel implements ResidualModel {
  constructor(public meta: ModelMeta, private exported: unknown) {}
  predict(_: { x: readonly number[] }): Prediction<Residual> {
    return { value: { dLonArcsec: 0, dLatArcsec: 0 }, confidence: 0.0, diagnostics: { note: "gbdt_stub_noop" } };
  }
}
