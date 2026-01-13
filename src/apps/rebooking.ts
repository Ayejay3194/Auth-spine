import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";
import { addDays, differenceInDays, format } from "date-fns";
import { mean } from "../assistant/utils";

function intervalDays(ctx: AssistantContext, serviceId: string): number {
  const done=ctx.bookings.filter(b=>b.serviceId===serviceId && b.status==="COMPLETED");
  if (done.length>=8){
    const xs:number[]=[];
    const by=new Map<string, typeof done>();
    for (const b of done){ if(!by.has(b.clientId)) by.set(b.clientId, [] as any); by.get(b.clientId)!.push(b); }
    for (const bs of by.values()){
      bs.sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
      for (let i=1;i<bs.length;i++) xs.push(differenceInDays(bs[i].startAt, bs[i-1].startAt));
    }
    const avg=mean(xs); if(avg) return Math.round(avg);
  }
  const s=ctx.services.find(s=>s.id===serviceId);
  if (s?.category?.toLowerCase().includes("cut")) return 28;
  if (s?.category?.toLowerCase().includes("color")) return 42;
  return 42;
}

export class RebookingEngine implements Engine {
  name="rebooking";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    const done=ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.status==="COMPLETED").slice(-50);
    for (const b of done){
      const int=intervalDays(ctx,b.serviceId);
      const due=addDays(b.startAt,int);
      const left=differenceInDays(due, ctx.now);
      const stage = left<=-7?"win_back": left<=0?"scarcity": left<=7?"urgency": left<=14?"gentle": null;
      if (!stage) continue;
      out.push(makeSuggestion({
        engine:this.name,
        title:"Rebooking reminder window",
        message:`Client ${b.clientId} hit "${stage}" stage (due ${format(due,"MMM d")}). Queue reminder + 24h hold?`,
        severity: stage==="win_back"?"warn":"info",
        practitionerId: ctx.practitioner.id,
        clientId: b.clientId,
        why:[`Estimated interval ${int} days`,`Days until due ${left}`,`Stages: 14d,7d,0d,-7d`],
        actions:[{label:"Queue reminder",intent:"queue_campaign",payload:{clientId:b.clientId,campaign:`rebook_${stage}`,holdHours:24}}]
      }));
    }
    return out;
  }
}
