import { Engine } from "../assistant/engine";
import { AssistantContext } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";

export class BenchmarkingEngine implements Engine {
  name="benchmarking";
  constructor(private monthlyGoalCents: number) {}
  run(ctx: AssistantContext) {
    const ym=ctx.now.toISOString().slice(0,7);
    const earned=ctx.orders.filter(o=>o.practitionerId===ctx.practitioner.id && o.createdAt.toISOString().slice(0,7)===ym).reduce((s,o)=>s+o.amountCents,0);
    const p=earned/this.monthlyGoalCents;
    return [makeSuggestion({
      engine:this.name,title:"Goal progress",
      message:`You’re at ${Math.round(p*100)}% of monthly goal ($${(this.monthlyGoalCents/100).toFixed(0)}).`,
      severity:p<0.6?"warn":"info",
      practitionerId:ctx.practitioner.id,
      why:["Progress = month-to-date revenue / goal."],
      actions:[{label:"Open goals",intent:"open_dashboard",payload:{tab:"goals"}}]
    })];
  }
}
