import { ModelMeta, Prediction, Residual, Model } from "../core/types";

export interface LinearResidualWeights {
  wLon: readonly number[];
  bLon: number;
  wLat: readonly number[];
  bLat: number;
}

export class LinearResidualModel implements Model<{ x: readonly number[] }, Residual> {
  constructor(public meta: ModelMeta, private weights: LinearResidualWeights) {}

  predict(input: { x: readonly number[] }): Prediction<Residual> {
    const dot = (w: readonly number[], x: readonly number[]) => {
      let s = 0;
      const n = Math.min(w.length, x.length);
      for (let i = 0; i < n; i++) s += w[i]! * x[i]!;
      return s;
    };

    const dLon = dot(this.weights.wLon, input.x) + this.weights.bLon;
    const dLat = dot(this.weights.wLat, input.x) + this.weights.bLat;

    return { value: { dLonArcsec: dLon, dLatArcsec: dLat }, confidence: 0.6 };
  }
}
