import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";

export type WaitlistEntry = {
  id: string;
  clientId: string;
  serviceId?: string;
  flexibility: "tight" | "medium" | "flex";
  priority: "vip" | "normal";
  createdAt: Date;
};

const score=(w:WaitlistEntry)=> (w.priority==="vip"?1:0.6)*0.6 + (w.flexibility==="flex"?1:w.flexibility==="medium"?0.7:0.4)*0.4;

export class WaitlistEngine implements Engine {
  name="waitlist";
  constructor(private waitlist: WaitlistEntry[] = []) {}
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    const cancelled=ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.status==="CANCELLED").slice(-10);
    for (const b of cancelled){
      const cand=this.waitlist.filter(w=>!w.serviceId||w.serviceId===b.serviceId).sort((a,b)=>score(b)-score(a))[0];
      if (!cand) continue;
      out.push(makeSuggestion({
        engine:this.name,title:"Fill cancellation from waitlist",
        message:`Slot opened. Offer to ${cand.clientId} first (score ${score(cand).toFixed(2)}).`,
        severity:"info",practitionerId:ctx.practitioner.id,clientId:cand.clientId,
        why:["Matched by service + VIP + flexibility.","Offer expires in 2 hours with 10% incentive."],
        actions:[{label:"Send offer",intent:"send_waitlist_offer",payload:{waitlistId:cand.id,bookingStartAt:b.startAt.toISOString(),incentivePct:10,expiresMin:120}}]
      }));
    }
    return out;
  }
}
