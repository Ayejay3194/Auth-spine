import type { Module, ModuleContext, ID } from "../../core/types";

interface SlotViewEvent {
  artistId: ID;
  slotStart: string;
  slotEnd: string;
  viewerUserId?: ID;
}

export class DemandShapingEngine implements Module {
  meta = {
    id: "36.demand-shaping",
    name: "Demand Shaping Engine",
    version: "1.0.0",
    provides: ["scarcity_gating", "urgency_metrics", "price_anchoring"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("booking.slot_viewed", async (e) => {
      const p = e.payload as SlotViewEvent;
      const key = `demand:slot_views:${p.artistId}:${p.slotStart}`;
      const count = (await ctx.store.get<number>(key)) ?? 0;
      await ctx.store.set(key, count + 1, { ttlSeconds: 60 * 60 * 24 });
    });

    ctx.events.subscribe("booking.slots_requested", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;
      if (!ctx.flags.enabled("demand.slot_gating", { artistId })) return;

      await ctx.events.publish({
        id: `evt_${Math.random()}`,
        type: "booking.policy_update",
        at: ctx.now(),
        subject: { artistId },
        payload: { policy: "gate_high_demand_slots", strength: 0.35 },
      });
    });
  }

  async getSlotUrgency(ctx: ModuleContext, artistId: ID, slotStart: string): Promise<number> {
    return (await ctx.store.get<number>(`demand:slot_views:${artistId}:${slotStart}`)) ?? 0;
  }
}
