import { Engine } from "../assistant/engine";
import { AssistantContext, MessageEvent, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";
import { differenceInHours } from "date-fns";

function bestHour(msgs: MessageEvent[]): number | null {
  const buckets=new Map<number,{sent:number;open:number}>();
  for (const m of msgs){
    const h=m.sentAt.getHours();
    if(!buckets.has(h)) buckets.set(h,{sent:0,open:0});
    const b=buckets.get(h)!; b.sent++; if(m.openedAt) b.open++;
  }
  const scored=[...buckets.entries()].map(([h,v])=>({h,rate:v.sent?v.open/v.sent:0,sent:v.sent})).filter(x=>x.sent>=3);
  scored.sort((a,b)=>b.rate-a.rate);
  return scored[0]?.h ?? null;
}

export class NotificationEngine implements Engine {
  name="notifications";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    for (const c of ctx.clients){
      const msgs=ctx.messages.filter(m=>m.clientId===c.id);
      if (msgs.length>=5){
        const h=bestHour(msgs);
        if (h!==null){
          out.push(makeSuggestion({
            engine:this.name,title:"Optimal send-time learned",
            message:`${c.email} opens most around ${h}:00. Schedule reminders at ${h-1}:55-ish.`,
            severity:"info",practitionerId:ctx.practitioner.id,clientId:c.id,
            why:["Open-rate by hour-of-day from past messages."],
            actions:[{label:"Set preference",intent:"set_client_send_pref",payload:{clientId:c.id,preferredHour:h}}]
          }));
        }
      }
      const recent=msgs.filter(m=>differenceInHours(ctx.now,m.sentAt)<=7*24);
      if (recent.length>=4){
        out.push(makeSuggestion({
          engine:this.name,title:"Reminder fatigue risk",
          message:`You hit ${recent.length} messages to ${c.email} in 7 days. Pause promos.`,
          severity:"warn",practitionerId:ctx.practitioner.id,clientId:c.id,
          why:[`Recent messages ${recent.length} >= 4 threshold`],
          actions:[{label:"Pause promos",intent:"pause_promos",payload:{clientId:c.id,days:7}}]
        }));
      }
    }
    return out;
  }
}
