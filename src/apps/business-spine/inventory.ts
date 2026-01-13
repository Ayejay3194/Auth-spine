import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";

export class InventoryEngine implements Engine {
  name="inventory";
  run(ctx: AssistantContext): Suggestion[] {
    const out: Suggestion[]=[];
    const upcoming=ctx.bookings.filter(b=>b.practitionerId===ctx.practitioner.id && b.status==="BOOKED");
    const usage=new Map<string, number>();
    for (const b of upcoming){
      for (const u of ctx.serviceUsage.filter(u=>u.serviceId===b.serviceId)){
        usage.set(u.itemId,(usage.get(u.itemId)??0)+u.unitsPerService);
      }
    }
    for (const item of ctx.inventory){
      const projected=usage.get(item.id)??0;
      const remaining=item.onHand-projected;
      if (remaining<=item.reorderPoint){
        out.push(makeSuggestion({
          engine:this.name,title:"Reorder alert",
          message:`${item.name} will drop to ~${remaining}${item.unit}. Reorder ${item.reorderQuantity}${item.unit}?`,
          severity: remaining<0?"critical":"warn",
          practitionerId: ctx.practitioner.id,
          why:[`On hand ${item.onHand}${item.unit}`,`Projected use ${projected}${item.unit}`,`Reorder point ${item.reorderPoint}${item.unit}`],
          actions:[{label:"Add to shopping list",intent:"add_reorder",payload:{itemId:item.id,qty:item.reorderQuantity}}]
        }));
      }
    }
    return out;
  }
}
