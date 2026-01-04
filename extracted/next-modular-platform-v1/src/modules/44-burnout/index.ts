import type { Module, ModuleContext, ID } from "../../core/types";
import { clamp01 } from "../../lib/util";

interface BurnoutSignals {
  scheduleDensity: number;
  messageToneDecline: number;
  ghostingRisk: number;
}

export class ArtistBurnoutDetection implements Module {
  meta = {
    id: "44.burnout",
    name: "Artist Burnout Detection",
    version: "1.0.0",
    provides: ["burnout_signals", "intervention_triggers"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("artist.day_closed", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;

      const signals = await this.computeSignals(ctx, artistId);
      await ctx.store.set(`burnout:${artistId}`, signals);

      const risk = clamp01(0.45 * signals.scheduleDensity + 0.3 * signals.messageToneDecline + 0.25 * signals.ghostingRisk);
      if (risk > 0.7) {
        await ctx.events.publish({
          id: `evt_${Math.random()}`,
          type: "artist.surface_action",
          at: ctx.now(),
          subject: { artistId },
          payload: {
            kind: "burnout_intervention",
            risk,
            signals,
            suggestions: ["reduce_capacity", "add_break_blocks", "enable_deposit_strict_mode"],
          },
        });
      }
    });
  }

  private async computeSignals(ctx: ModuleContext, artistId: ID): Promise<BurnoutSignals> {
    const scheduleDensity = (await ctx.store.get<number>(`agg:schedule_density:${artistId}`)) ?? 0.6;
    const messageToneDecline = (await ctx.store.get<number>(`agg:message_tone_decline:${artistId}`)) ?? 0.2;
    const ghostingRisk = (await ctx.store.get<number>(`agg:ghosting_risk:${artistId}`)) ?? 0.15;
    return { scheduleDensity, messageToneDecline, ghostingRisk };
  }
}
