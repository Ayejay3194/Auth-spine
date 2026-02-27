export type Interaction = { userId: string; itemId: string; r: number };
export interface MFOpts { factors?: number; lr?: number; reg?: number; epochs?: number; }

export class MatrixFactorization {
  private U=new Map<string, number[]>(); private V=new Map<string, number[]>();
  constructor(private opts: MFOpts = {}) {}

  private vec(id: string, m: Map<string, number[]>, k: number): number[] {
    let v=m.get(id);
    if(!v){ v=Array.from({length:k},()=> (Math.random()*2-1)*0.1); m.set(id,v); }
    return v;
  }

  fit(data: Interaction[]): void {
    const k=this.opts.factors ?? 16, lr=this.opts.lr ?? 0.05, reg=this.opts.reg ?? 0.01, epochs=this.opts.epochs ?? 20;
    for(let ep=0; ep<epochs; ep++){
      for(const ex of data){
        const u=this.vec(ex.userId,this.U,k);
        const v=this.vec(ex.itemId,this.V,k);
        let pred=0; for(let i=0;i<k;i++) pred += u[i]!*v[i]!;
        const err=pred-ex.r;
        for(let i=0;i<k;i++){
          const ui=u[i]!, vi=v[i]!;
          u[i]=ui - lr*(err*vi + reg*ui);
          v[i]=vi - lr*(err*ui + reg*vi);
        }
      }
    }
  }

  score(userId:string,itemId:string): number {
    const u=this.U.get(userId), v=this.V.get(itemId);
    if(!u||!v) return 0;
    let s=0; for(let i=0;i<Math.min(u.length,v.length);i++) s += u[i]!*v[i]!;
    return s;
  }

  recommend(userId:string, items:string[], k=10){
    return items.map(itemId=>({itemId,score:this.score(userId,itemId)})).sort((a,b)=>b.score-a.score).slice(0,k);
  }
}
