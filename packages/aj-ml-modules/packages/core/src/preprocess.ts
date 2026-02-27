import type { Matrix, Transformer, Vector } from "./types";
import { mean, variance } from "./math";

export class StandardScaler implements Transformer {
  private mu: Vector = [];
  private sigma: Vector = [];

  fit(X: Matrix): void {
    if (!X.length) return;
    const d = X[0]!.length;
    this.mu = new Array(d).fill(0);
    this.sigma = new Array(d).fill(1);
    for (let j=0;j<d;j++){
      const col = X.map(r => r[j] ?? 0);
      this.mu[j] = mean(col);
      this.sigma[j] = Math.sqrt(variance(col)) || 1;
    }
  }

  transform(X: Matrix): Matrix {
    return X.map(r => r.map((x,j)=> (x - (this.mu[j]??0)) / (this.sigma[j]??1)));
  }
}
