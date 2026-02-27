import type { Matrix, Vector } from "../types.js";
import type { FitOptions, Model } from "./model.js";
import { batch } from "../data/batch.js";
import { dot, sigmoid } from "./utils.js";

export class LogisticRegression implements Model<number> {
  name = "LogisticRegression";
  task: "binary_classification" = "binary_classification";

  private w: Vector;
  private b: number;

  constructor(readonly d: number, private hp: { l2?: number } = {}) {
    this.w = new Float64Array(d);
    this.b = 0;
  }

  params() { return { w: Array.from(this.w), b: this.b }; }
  hyperparams() { return { ...this.hp, d: this.d }; }

  /** Returns probabilities in [0,1] */
  predictProba(X: Matrix): number[] {
    return X.map((x) => sigmoid(dot(this.w, x) + this.b));
  }

  /** Returns hard labels 0/1 using threshold 0.5 */
  predict(X: Matrix): number[] {
    return this.predictProba(X).map((p) => (p >= 0.5 ? 1 : 0));
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
          const xi = X[i]!;
          const yi = y[i]!;
          const z = dot(this.w, xi) + this.b;
          const p = sigmoid(z);

          // log loss (cross-entropy)
          const eps = 1e-12;
          lossSum += -(yi * Math.log(p + eps) + (1 - yi) * Math.log(1 - p + eps));

          const err = p - yi; // gradient for logistic
          for (let j = 0; j < this.d; j++) gw[j] += err * xi[j]!;
          gb += err;
        }

        if (l2 > 0) for (let j = 0; j < this.d; j++) gw[j] += l2 * this.w[j]!;

        const lr = opts.learningRate / Math.max(1, idxBatch.length);
        for (let j = 0; j < this.d; j++) this.w[j] -= lr * gw[j]!;
        this.b -= lr * gb;
      }

      if (opts.verbose) {
        const ll = lossSum / Math.max(1, X.length);
        // eslint-disable-next-line no-console
        console.log(`[epoch ${epoch + 1}] logloss=${ll.toFixed(6)}`);
      }
    }
  }

  toJSON(): { d: number; w: number[]; b: number; hp: { l2?: number } } {
    return { d: this.d, w: Array.from(this.w), b: this.b, hp: this.hp };
  }

  static fromJSON(obj: { d: number; w: number[]; b: number; hp?: { l2?: number } }): LogisticRegression {
    const m = new LogisticRegression(obj.d, obj.hp ?? {});
    m.w = new Float64Array(obj.w);
    m.b = obj.b;
    return m;
  }
}
