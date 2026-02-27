import type { Matrix, Vector } from "../types.js";

export class StandardScaler {
  private mean?: Vector;
  private std?: Vector;

  fit(X: Matrix): this {
    if (X.length === 0) throw new Error("Cannot fit scaler on empty X");
    const n = X.length;
    const d = X[0]!.length;
    const mean = new Float64Array(d);
    const varr = new Float64Array(d);

    for (const x of X) for (let j = 0; j < d; j++) mean[j] += x[j]!;
    for (let j = 0; j < d; j++) mean[j] /= n;

    for (const x of X) for (let j = 0; j < d; j++) {
      const diff = x[j]! - mean[j]!;
      varr[j] += diff * diff;
    }

    for (let j = 0; j < d; j++) {
      const s = Math.sqrt(varr[j]! / Math.max(1, n - 1));
      varr[j] = s === 0 ? 1 : s;
    }

    this.mean = mean;
    this.std = varr;
    return this;
  }

  transform(X: Matrix): Matrix {
    return X.map((x) => this.transformOne(x));
  }

  transformOne(x: Vector): Vector {
    if (!this.mean || !this.std) throw new Error("StandardScaler not fitted.");
    if (x.length !== this.mean.length) throw new Error("Dimension mismatch in scaler.");
    const out = new Float64Array(x.length);
    for (let j = 0; j < x.length; j++) out[j] = (x[j]! - this.mean[j]!) / this.std[j]!;
    return out;
  }

  toJSON(): { mean: number[]; std: number[] } {
    if (!this.mean || !this.std) throw new Error("StandardScaler not fitted.");
    return { mean: Array.from(this.mean), std: Array.from(this.std) };
  }

  static fromJSON(obj: { mean: number[]; std: number[] }): StandardScaler {
    const s = new StandardScaler();
    s.mean = new Float64Array(obj.mean);
    s.std = new Float64Array(obj.std);
    return s;
  }
}
