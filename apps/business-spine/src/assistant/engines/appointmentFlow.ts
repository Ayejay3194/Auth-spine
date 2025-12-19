import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";
import { median } from "../assistant/utils";

export class AppointmentFlowEngine implements Engine {
  name="appointment_flow";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    const by=new Map<string, number[]>();
    for (const b of ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.status==="COMPLETED")){
      const m=/overrun:\s*\+?(\d+)/i.exec(b.notes??""); if(!m) continue;
      const v=parseInt(m[1],10);
      if(!by.has(b.serviceId)) by.set(b.serviceId,[]);
      by.get(b.serviceId)!.push(v);
    }
    for (const [serviceId,xs] of by.entries()){
      const med=median(xs);
      if (med>=15){
        const title=ctx.services.find(s=>s.id===serviceId)?.title ?? serviceId;
        out.push(makeSuggestion({
          engine:this.name,title:"Service duration learner",
          message:`"${title}" median overrun ${med} min. Update duration/buffer to prevent overlaps.`,
          severity: med>=30?"warn":"info",
          practitionerId: ctx.practitioner.id,
          why:[`Median overrun computed from notes: ${med} min`],
          actions:[{label:"Update duration",intent:"update_service_duration",payload:{serviceId,addBufferMin:med}}]
        }));
      }
    }
    return out;
  }
}
