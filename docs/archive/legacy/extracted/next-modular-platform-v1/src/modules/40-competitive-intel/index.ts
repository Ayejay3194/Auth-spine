import type { Module, ModuleContext, ID } from "../../core/types";

interface MarketSnapshot {
  artistId: ID;
  areaKey: string;
  avgPriceDeltaPct: number;
  serviceGaps: string[];
  weekendArbitrage: "competitors_full_you_open" | "normal" | "unknown";
  trendVelocity: Array<{ tag: string; velocity: number }>;
}

export class CompetitiveIntelligenceShadowSystem implements Module {
  meta = {
    id: "40.competitive-intel",
    name: "Competitive Intelligence Shadow System",
    version: "1.0.0",
    provides: ["market_positioning", "gap_detection", "availability_arbitrage", "trend_velocity"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("artist.dashboard_opened", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;

      if (!ctx.privacy.hasConsent({ artistId }, "competitive_monitoring")) return;

      const snapshot = await this.buildSnapshot(ctx, artistId);
      await ctx.events.publish({
        id: `evt_${Math.random()}`,
        type: "artist.market_snapshot_ready",
        at: ctx.now(),
        subject: { artistId },
        payload: snapshot,
      });
    });
  }

  private async buildSnapshot(ctx: ModuleContext, artistId: ID): Promise<MarketSnapshot> {
    const areaKey = (await ctx.store.get<string>(`market:area:${artistId}`)) ?? "unknown";
    const avgPriceDeltaPct = (await ctx.store.get<number>(`market:price_delta_pct:${artistId}`)) ?? 0;
    const serviceGaps = (await ctx.store.get<string[]>(`market:service_gaps:${artistId}`)) ?? [];
    const weekendArbitrage =
      (await ctx.store.get<MarketSnapshot["weekendArbitrage"]>(`market:weekend_arbitrage:${artistId}`)) ?? "unknown";
    const trendVelocity = (await ctx.store.get<Array<{ tag: string; velocity: number }>>(`market:trend_velocity:${areaKey}`)) ?? [];
    return { artistId, areaKey, avgPriceDeltaPct, serviceGaps, weekendArbitrage, trendVelocity };
  }
}
