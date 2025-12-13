import { Engine } from "../assistant/engine";
import { AssistantContext, Booking, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";
import { differenceInMinutes, format } from "date-fns";
import { median } from "../assistant/utils";

const byStart=(a:Booking,b:Booking)=>a.startAt.getTime()-b.startAt.getTime();

function estimateOverrun(bookings: Booking[], serviceId: string): number {
  const xs:number[]=[];
  for (const b of bookings) {
    if (b.serviceId!==serviceId || b.status!=="COMPLETED") continue;
    const m=/overrun:\s*\+?(\d+)/i.exec(b.notes??"");
    if (m) xs.push(parseInt(m[1],10));
  }
  return median(xs);
}

export class PredictiveSchedulingEngine implements Engine {
  name="predictive_scheduling";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    const upcoming=ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.status==="BOOKED").sort(byStart);

    // Gap filler
    for (let i=0;i<upcoming.length-1;i++){
      const a=upcoming[i], b=upcoming[i+1];
      const gap=differenceInMinutes(b.startAt, a.endAt);
      if (gap>=45){
        out.push(makeSuggestion({
          engine:this.name,
          title:"Gap filler opportunity",
          message:`You have a ${gap} min gap on ${format(a.endAt,"EEE MMM d")} (${format(a.endAt,"p")}–${format(b.startAt,"p")}). Flash-discount it?`,
          severity:"info",
          practitionerId: ctx.practitioner.id,
          why:[`Gap >= 45 min threshold (${gap} min).`,`Last-minute offers fill dead time without adding hours.`],
          actions:[{label:"Create flash offer",intent:"create_flash_offer",payload:{startAt:a.endAt.toISOString(),endAt:b.startAt.toISOString(),discountPct:10}}]
        }));
      }
    }

    // Buffer auto-adjust
    for (const s of ctx.services.filter(s=>s.practitionerId===ctx.practitioner.id && s.type==="LIVE")){
      const over=estimateOverrun(ctx.bookings, s.id);
      if (over>=10){
        out.push(makeSuggestion({
          engine:this.name,
          title:"Buffer time auto-adjust",
          message:`"${s.title}" runs ~${over} min over (median). Add buffer so your day stops spiraling?`,
          severity: over>=25?"warn":"info",
          practitionerId: ctx.practitioner.id,
          why:[`Median overrun inferred from completed notes: ${over} min.`,`Buffers reduce cascading lateness + reschedules.`],
          actions:[{label:"Update buffers",intent:"update_service_buffers",payload:{serviceId:s.id,afterMin:over}}]
        }));
      }
    }

    return out;
  }
}
