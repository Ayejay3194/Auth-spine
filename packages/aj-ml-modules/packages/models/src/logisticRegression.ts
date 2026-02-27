import type { Matrix, Predictor, Vector } from "@aj/core";
import { dot, sigmoid } from "@aj/core";

export interface LogisticRegressionOpts { lr?: number; epochs?: number; l2?: number; }

export class LogisticRegression implements Predictor {
  private w: Vector = [];
  private b = 0;
  constructor(private opts: LogisticRegressionOpts = {}) {}

  fit(X: Matrix, y: Vector): void {
    const lr=this.opts.lr ?? 0.1, epochs=this.opts.epochs ?? 800, l2=this.opts.l2 ?? 0;
    const n=X.length; const d=X[0]?.length ?? 0;
    this.w=new Array(d).fill(0); this.b=0;

    for(let ep=0; ep<epochs; ep++){
      const dw=new Array(d).fill(0); let db=0;
      for(let i=0;i<n;i++){
        const row=X[i]!;
        const p=sigmoid(dot(row,this.w)+this.b);
        const err=p-(y[i]??0);
        db += err;
        for(let j=0;j<d;j++) dw[j] += err*(row[j]??0);
      }
      db /= n||1;
      for(let j=0;j<d;j++) dw[j] = (dw[j]/(n||1)) + l2*(this.w[j]??0);
      this.b -= lr*db;
      for(let j=0;j<d;j++) this.w[j] = (this.w[j]??0) - lr*(dw[j]??0);
    }
  }

  predictProba(X: Matrix): number[][] {
    return X.map(row => {
      const p=sigmoid(dot(row,this.w)+this.b);
      return [1-p,p];
    });
  }

  predict(X: Matrix): Vector { return this.predictProba(X).map(p => (p[1]??0) >= 0.5 ? 1 : 0); }
}
