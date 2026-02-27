import type { Matrix, Predictor, Vector } from "@aj/core";
import { sigmoid } from "@aj/core";

export interface TinyNNOpts { hidden?: number; lr?: number; epochs?: number; }

const relu=(x:number)=> x>0?x:0;
const drelu=(x:number)=> x>0?1:0;

export class TinyNN implements Predictor {
  private W1:number[][]=[]; private b1:number[]=[]; private W2:number[]=[]; private b2=0;
  constructor(private opts:TinyNNOpts={}){}

  fit(X:Matrix,y:Vector): void {
    const n=X.length, d=X[0]?.length ?? 0;
    const h=this.opts.hidden ?? 16, lr=this.opts.lr ?? 0.05, epochs=this.opts.epochs ?? 800;
    const rand=()=> (Math.random()*2-1)*0.1;
    this.W1=Array.from({length:h},()=>Array.from({length:d},rand));
    this.b1=Array.from({length:h},()=>0);
    this.W2=Array.from({length:h},rand);
    this.b2=0;

    for(let ep=0; ep<epochs; ep++){
      for(let i=0;i<n;i++){
        const xi=X[i]!, yi=y[i]??0;
        const z1=new Array(h).fill(0); const a1=new Array(h).fill(0);
        for(let j=0;j<h;j++){
          let s=this.b1[j]??0;
          for(let k=0;k<d;k++) s += (this.W1[j]![k]??0)*(xi[k]??0);
          z1[j]=s; a1[j]=relu(s);
        }
        let z2=this.b2;
        for(let j=0;j<h;j++) z2 += (this.W2[j]??0)*(a1[j]??0);
        const p=sigmoid(z2);
        const dz2=p-yi;

        for(let j=0;j<h;j++) this.W2[j]=(this.W2[j]??0)-lr*(dz2*(a1[j]??0));
        this.b2 -= lr*dz2;

        for(let j=0;j<h;j++){
          const da1=(this.W2[j]??0)*dz2;
          const dz1=da1*drelu(z1[j]??0);
          this.b1[j]=(this.b1[j]??0)-lr*dz1;
          for(let k=0;k<d;k++) this.W1[j]![k]=(this.W1[j]![k]??0)-lr*(dz1*(xi[k]??0));
        }
      }
    }
  }

  predict(X:Matrix): Vector {
    const h=this.W1.length, d=X[0]?.length ?? 0;
    return X.map(xi=>{
      const a1=new Array(h).fill(0);
      for(let j=0;j<h;j++){
        let s=this.b1[j]??0;
        for(let k=0;k<d;k++) s += (this.W1[j]![k]??0)*(xi[k]??0);
        a1[j]=relu(s);
      }
      let z2=this.b2;
      for(let j=0;j<h;j++) z2 += (this.W2[j]??0)*(a1[j]??0);
      return sigmoid(z2)>=0.5?1:0;
    });
  }
}
