import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";
import { clamp, mean, pct } from "../assistant/utils";
import { addDays } from "date-fns";

function fillRate(ctx: AssistantContext, weekday: number): number {
  const start=addDays(ctx.now,-60);
  const byDay=new Map<string, number>();
  for (const b of ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.startAt>=start && (b.status==="BOOKED"||b.status==="COMPLETED") && b.startAt.getDay()===weekday)){
    const k=b.startAt.toISOString().slice(0,10);
    byDay.set(k,(byDay.get(k)??0)+1);
  }
  const counts=[...byDay.values()];
  const cap=Math.max(1, Math.max(...counts,1));
  return clamp((mean(counts)||0)/cap,0,1);
}

export class DynamicPricingEngine implements Engine {
  name="dynamic_pricing";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    for (const wd of [2,6]){
      const fr=fillRate(ctx,wd);
      const day=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][wd];
      if (fr>=0.85){
        out.push(makeSuggestion({
          engine:this.name,title:"Demand-based price increase",
          message:`${day}s fill ~${pct(fr)}. Consider +15% pricing for ${day} slots.`,
          severity:"info",practitionerId:ctx.practitioner.id,
          why:[`Fill rate ${pct(fr)} >= 85%`],
          actions:[{label:"Create pricing rule",intent:"create_pricing_rule",payload:{weekday:wd,adjustPct:15}}]
        }));
      } else if (fr<=0.5){
        out.push(makeSuggestion({
          engine:this.name,title:"Demand-based discount",
          message:`${day}s fill ~${pct(fr)}. Consider -10% promos to fill gaps.`,
          severity:"info",practitionerId:ctx.practitioner.id,
          why:[`Fill rate ${pct(fr)} <= 50%`],
          actions:[{label:"Create promo rule",intent:"create_pricing_rule",payload:{weekday:wd,adjustPct:-10}}]
        }));
      }
    }
    return out;
  }
}
