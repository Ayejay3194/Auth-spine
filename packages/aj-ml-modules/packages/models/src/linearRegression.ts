import type { Matrix, Predictor, Vector } from "@aj/core";
import { matVec } from "@aj/core";

export interface LinearRegressionOpts { lr?: number; epochs?: number; l2?: number; }

export class LinearRegressionGD implements Predictor {
  private w: Vector = [];
  private b = 0;
  constructor(private opts: LinearRegressionOpts = {}) {}

  fit(X: Matrix, y: Vector): void {
    const lr=this.opts.lr ?? 0.01, epochs=this.opts.epochs ?? 600, l2=this.opts.l2 ?? 0;
    const n=X.length; const d=X[0]?.length ?? 0;
    this.w=new Array(d).fill(0); this.b=0;

    for(let ep=0; ep<epochs; ep++){
      const yhat=this.predict(X);
      const dw=new Array(d).fill(0); let db=0;
      for(let i=0;i<n;i++){
        const err=(yhat[i]??0)-(y[i]??0); db += err;
        const row=X[i]!;
        for(let j=0;j<d;j++) dw[j] += err*(row[j]??0);
      }
      db /= n||1;
      for(let j=0;j<d;j++) dw[j] = (dw[j]/(n||1)) + l2*(this.w[j]??0);
      this.b -= lr*db;
      for(let j=0;j<d;j++) this.w[j] = (this.w[j]??0) - lr*(dw[j]??0);
    }
  }

  predict(X: Matrix): Vector {
    const out = matVec(X, this.w);
    for(let i=0;i<out.length;i++) out[i] = (out[i]??0) + this.b;
    return out;
  }

  params(){ return { w:this.w, b:this.b }; }
}
