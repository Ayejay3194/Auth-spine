import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";

export class MarketingEngine implements Engine {
  name="marketing";
  run(ctx: AssistantContext): Suggestion[] {
    const counts=new Map<string, number>();
    for (const c of ctx.clients) counts.set(c.marketingSource??"unknown",(counts.get(c.marketingSource??"unknown")??0)+1);
    const top=[...counts.entries()].sort((a,b)=>b[1]-a[1])[0];
    if (!top) return [];
    return [makeSuggestion({
      engine:this.name,title:"Attribution snapshot",
      message:`Top acquisition source: ${top[0]} (${top[1]} clients).`,
      severity:"info",practitionerId:ctx.practitioner.id,
      why:["Counts clients by attributed source. Plug into UTMs/referral codes for accuracy."],
      actions:[{label:"Open marketing dashboard",intent:"open_dashboard",payload:{tab:"marketing"}}]
    })];
  }
}
