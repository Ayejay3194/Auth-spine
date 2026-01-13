import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";
import { differenceInDays } from "date-fns";

export class SegmentationEngine implements Engine {
  name="segmentation";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    const spend=new Map<string, number>();
    for (const o of ctx.orders.filter(o=>o.practitionerId===ctx.practitioner.id)){
      spend.set(o.clientId,(spend.get(o.clientId)??0)+o.amountCents);
    }
    const ranked=[...spend.entries()].sort((a,b)=>b[1]-a[1]);
    const vipCut=Math.max(1, Math.floor(ranked.length*0.1));
    const vip=new Set(ranked.slice(0,vipCut).map(([id])=>id));
    for (const c of ctx.clients){
      const last=ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.clientId===c.id).sort((a,b)=>b.startAt.getTime()-a.startAt.getTime())[0];
      const tags:string[]=[];
      if (!last) tags.push("new"); else tags.push(differenceInDays(ctx.now,last.startAt)>=90?"lapsed":"active");
      if (vip.has(c.id)) tags.push("vip");
      const cur=new Set(c.tags??[]);
      if (tags.some(t=>!cur.has(t))){
        out.push(makeSuggestion({
          engine:this.name,title:"Auto-tag client",
          message:`Tag ${c.email} as: ${tags.join(", ")}`,
          severity:"info",practitionerId:ctx.practitioner.id,clientId:c.id,
          why:["Tags are deterministic: last booking recency + top-spend VIP tier."],
          actions:[{label:"Apply tags",intent:"apply_client_tags",payload:{clientId:c.id,tags}}]
        }));
      }
    }
    return out;
  }
}
