import type { Matrix, Vector } from "../types.js";
import type { FitOptions, Model } from "./model.js";
import { batch } from "../data/batch.js";
import { dot } from "./utils.js";

export class LinearRegression implements Model<number> {
  name = "LinearRegression";
  task: "regression" = "regression";

  private w: Vector;
  private b: number;

  constructor(readonly d: number, private hp: { l2?: number } = {}) {
    this.w = new Float64Array(d);
    this.b = 0;
  }

  params() { return { w: Array.from(this.w), b: this.b }; }
  hyperparams() { return { ...this.hp, d: this.d }; }

  predict(X: Matrix): number[] {
    return X.map((x) => dot(this.w, x) + this.b);
  }

  fit(X: Matrix, y: number[], opts: FitOptions): void {
    if (X.length !== y.length) throw new Error("X/y length mismatch");
    const l2 = opts.l2 ?? this.hp.l2 ?? 0;

    const idxAll = [...Array(X.length).keys()];
    for (let epoch = 0; epoch < opts.epochs; epoch++) {
      let lossSum = 0;

      for (const idxBatch of batch(idxAll, opts.batchSize)) {
        const gw = new Float64Array(this.d);
        let gb = 0;

        for (const i of idxBatch) {
          const pred = dot(this.w, X[i]!) + this.b;
          const err = pred - y[i]!;
          lossSum += err * err;

          const xi = X[i]!;
          for (let j = 0; j < this.d; j++) gw[j] += 2 * err * xi[j]!;
          gb += 2 * err;
        }

        if (l2 > 0) for (let j = 0; j < this.d; j++) gw[j] += 2 * l2 * this.w[j]!;

        const lr = opts.learningRate / Math.max(1, idxBatch.length);
        for (let j = 0; j < this.d; j++) this.w[j] -= lr * gw[j]!;
        this.b -= lr * gb;
      }

      if (opts.verbose) {
        const mse = lossSum / Math.max(1, X.length);
        // eslint-disable-next-line no-console
        console.log(`[epoch ${epoch + 1}] mse=${mse.toFixed(6)}`);
      }
    }
  }

  toJSON(): { d: number; w: number[]; b: number; hp: { l2?: number } } {
    return { d: this.d, w: Array.from(this.w), b: this.b, hp: this.hp };
  }

  static fromJSON(obj: { d: number; w: number[]; b: number; hp?: { l2?: number } }): LinearRegression {
    const m = new LinearRegression(obj.d, obj.hp ?? {});
    m.w = new Float64Array(obj.w);
    m.b = obj.b;
    return m;
  }
}
