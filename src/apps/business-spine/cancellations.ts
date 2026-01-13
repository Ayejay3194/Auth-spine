import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";
import { differenceInHours } from "date-fns";

export class CancellationEngine implements Engine {
  name="cancellations";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    for (const b of ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.status==="CANCELLED").slice(-50)){
      const m=/cancelAt:(.+)/i.exec(b.notes??"");
      if (!m) continue;
      const cancelAt=new Date(m[1]);
      const h=differenceInHours(b.startAt,cancelAt);
      if (h<=24){
        out.push(makeSuggestion({
          engine:this.name,title:"Late cancellation fee",
          message:`Booking ${b.id} cancelled ${h}h before start. Apply 50% fee?`,
          severity:"info",practitionerId:ctx.practitioner.id,clientId:b.clientId,bookingId:b.id,
          why:[`Policy window 24h, cancelled ${h}h before start.`],
          actions:[{label:"Charge fee",intent:"charge_cancellation_fee",payload:{bookingId:b.id,pct:50}}]
        }));
      }
    }
    return out;
  }
}
