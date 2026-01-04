import type { Module, ModuleContext, ID } from "../../core/types";
import type { PortfolioAsset, ServiceListing } from "../../domain/entities";
import { clamp01 } from "../../lib/util";

interface QualityFindings {
  portfolio?: Array<{ assetId: ID; score: number; flags: string[] }>;
  copy?: Array<{ listingId: ID; score: number; flags: string[] }>;
  friction?: { bookingDropoffRate: number; flags: string[] };
}

export class InvisibleQualityControlLayer implements Module {
  meta = {
    id: "35.quality-control",
    name: "Invisible Quality Control Layer",
    version: "1.0.0",
    provides: ["portfolio_scoring", "copy_quality", "booking_friction"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("artist.asset_uploaded", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;
      const asset = e.payload as PortfolioAsset;

      const score = this.scoreAsset(asset);
      await ctx.store.set(`qc:asset:${asset.id}`, score);

      if (score.flags.length) {
        await this.surface(ctx, artistId, {
          portfolio: [{ assetId: asset.id, score: score.score, flags: score.flags }],
        });
      }
    });

    ctx.events.subscribe("artist.listing_updated", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;
      const listing = e.payload as ServiceListing;

      const copy = this.scoreCopy(listing);
      await ctx.store.set(`qc:copy:${listing.id}`, copy);

      if (copy.flags.length) {
        await this.surface(ctx, artistId, { copy: [{ listingId: listing.id, score: copy.score, flags: copy.flags }] });
      }
    });

    ctx.events.subscribe("booking.flow_abandoned", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;

      const key = `qc:friction:dropoff:${artistId}`;
      const prev = (await ctx.store.get<{ total: number; abandoned: number }>(key)) ?? { total: 0, abandoned: 0 };
      prev.total += 1;
      prev.abandoned += 1;
      await ctx.store.set(key, prev);

      const rate = prev.total ? prev.abandoned / prev.total : 0;
      if (rate > 0.25) {
        await this.surface(ctx, artistId, { friction: { bookingDropoffRate: rate, flags: ["high_dropoff_rate"] } });
      }
    });
  }

  private scoreAsset(asset: PortfolioAsset): { score: number; flags: string[] } {
    const flags: string[] = [];
    const w = asset.meta?.width ?? 0;
    const h = asset.meta?.height ?? 0;

    if (w && h && (w < 900 || h < 900)) flags.push("low_resolution");
    if (!asset.meta?.mime) flags.push("missing_mime");

    const score = clamp01(1 - flags.length * 0.2);
    return { score, flags };
  }

  private scoreCopy(listing: ServiceListing): { score: number; flags: string[] } {
    const flags: string[] = [];
    const text = `${listing.title}\n${listing.description}`;

    if (/\b(alot)\b/i.test(text)) flags.push("typo_alot");
    if ((text.match(/!/g) ?? []).length > 6) flags.push("excess_exclamation");
    if (listing.description.length < 60) flags.push("too_short_description");

    const score = clamp01(1 - flags.length * 0.18);
    return { score, flags };
  }

  private async surface(ctx: ModuleContext, artistId: ID, findings: QualityFindings) {
    await ctx.events.publish({
      id: `evt_${Math.random()}`,
      type: "artist.surface_action",
      at: ctx.now(),
      subject: { artistId },
      payload: { kind: "quality_control", findings },
    });
  }
}
