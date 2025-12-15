import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";
import { addHours, differenceInHours } from "date-fns";

export class ReviewAutomationEngine implements Engine {
  name="reviews";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    for (const b of ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.status==="COMPLETED").slice(-50)){
      const due=addHours(b.endAt,4);
      if (differenceInHours(ctx.now,due)===0){
        out.push(makeSuggestion({
          engine:this.name,title:"Send review request",
          message:`Optimal review ask time for booking ${b.id} (4h after completion).`,
          severity:"info",practitionerId:ctx.practitioner.id,clientId:b.clientId,bookingId:b.id,
          why:["Asking shortly after service boosts response rates.","Gate unhappy clients to private feedback first."],
          actions:[{label:"Send request",intent:"send_message",payload:{bookingId:b.id,template:"review_request"}}]
        }));
      }
    }
    return out;
  }
}
