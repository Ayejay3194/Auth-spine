import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";

export class FinanceEngine implements Engine {
  name="finance";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    const orders=ctx.orders.filter(o=>o.practitionerId===ctx.practitioner.id);
    if (orders.length<10) return out;
    const days=Math.max(1,new Set(orders.map(o=>o.createdAt.toISOString().slice(0,10))).size);
    const total=orders.reduce((s,o)=>s+o.amountCents,0)/100;
    const daily=total/days;
    const forecast=daily*30;
    const booked=ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.status==="BOOKED").reduce((s,b)=>s+b.pricePaidCents,0)/100;
    out.push(makeSuggestion({
      engine:this.name,title:"Cashflow forecast",
      message:`Projected 30-day revenue ≈ $${forecast.toFixed(0)} (booked pipeline: $${booked.toFixed(0)}).`,
      severity:"info",practitionerId:ctx.practitioner.id,
      why:[`Daily avg from history ≈ $${daily.toFixed(2)}/day`,`Booked pipeline is deterministic from calendar.`],
      actions:[{label:"Open finance dashboard",intent:"open_dashboard",payload:{tab:"finance"}}]
    }));
    return out;
  }
}
