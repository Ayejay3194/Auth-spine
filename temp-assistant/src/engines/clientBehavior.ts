import { Engine } from "../assistant/engine";
import { AssistantContext, Booking, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";
import { clamp, mean, pct } from "../assistant/utils";
import { differenceInDays } from "date-fns";

function bookingsFor(ctx: AssistantContext, clientId: string) {
  return ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.clientId===clientId);
}
function cadenceDays(bs: Booking[]): number {
  const xs:number[]=[];
  const c=bs.filter(b=>b.status==="COMPLETED").sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
  for (let i=1;i<c.length;i++) xs.push(differenceInDays(c[i].startAt,c[i-1].startAt));
  return mean(xs)||42;
}

function noShowScore(ctx: AssistantContext, b: Booking): {score:number; why:string[]} {
  const past=bookingsFor(ctx,b.clientId).filter(x=>x.startAt<b.startAt && ["COMPLETED","NO_SHOW","CANCELLED"].includes(x.status));
  const ns=past.filter(x=>x.status==="NO_SHOW").length;
  const total=past.length||1;
  const hist=ns/total;
  const lead=clamp(differenceInDays(b.startAt,b.createdAt),0,60)/60;
  const dow=(b.startAt.getDay()===1||b.startAt.getDay()===5)?0.15:0.05;
  const last=past.filter(x=>x.status==="COMPLETED").sort((a,b)=>b.startAt.getTime()-a.startAt.getTime())[0];
  const lapse=last?clamp(differenceInDays(b.startAt,last.startAt),0,180)/180:0.5;
  const score=clamp(0.2*lead + 0.45*hist + 0.1*dow + 0.25*lapse,0,1);
  return {score,why:[`Lead-time factor ${lead.toFixed(2)}`,`No-show history ${pct(hist)} (${ns}/${total})`,`DOW heuristic ${dow.toFixed(2)}`,`Lapse factor ${lapse.toFixed(2)}`,`Score ${score.toFixed(2)}`]};
}

export class ClientBehaviorEngine implements Engine {
  name="client_behavior";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    // Churn detector
    for (const c of ctx.clients){
      const bs=bookingsFor(ctx,c.id);
      if (bs.filter(b=>b.status==="COMPLETED").length<2) continue;
      const cad=cadenceDays(bs);
      const last=bs.sort((a,b)=>b.startAt.getTime()-a.startAt.getTime())[0];
      const lapse=differenceInDays(ctx.now,last.startAt);
      if (lapse>cad*1.4){
        out.push(makeSuggestion({
          engine:this.name,
          title:"Churn risk detected",
          message:`${c.email} usually returns every ~${Math.round(cad)} days. They’re at ${lapse}. Win-back message?`,
          severity:lapse>cad*2?"warn":"info",
          practitionerId: ctx.practitioner.id,
          clientId: c.id,
          why:[`Cadence from history ≈ ${Math.round(cad)} days`,`Current lapse ${lapse} days`,`Threshold cadence×1.4`],
          actions:[{label:"Queue win-back",intent:"queue_campaign",payload:{clientId:c.id,campaign:"win_back"}}]
        }));
      }
    }
    // No-show predictor
    for (const b of ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.status==="BOOKED")){
      const r=noShowScore(ctx,b);
      if (r.score>=0.65){
        out.push(makeSuggestion({
          engine:this.name,
          title:"High no-show risk",
          message:`Booking ${b.id} is ${pct(r.score)} likely to no-show. Require deposit or reconfirm.`,
          severity:r.score>=0.8?"critical":"warn",
          practitionerId: ctx.practitioner.id,
          clientId: b.clientId,
          bookingId: b.id,
          why:r.why,
          actions:[
            {label:"Require deposit",intent:"require_deposit",payload:{bookingId:b.id,depositPct:30}},
            {label:"Send confirm text",intent:"send_message",payload:{bookingId:b.id,template:"confirm_appointment"}}
          ]
        }));
      }
    }
    return out;
  }
}
