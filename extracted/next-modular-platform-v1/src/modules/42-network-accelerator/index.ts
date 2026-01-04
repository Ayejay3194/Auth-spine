import type { Module, ModuleContext, ID } from "../../core/types";
import { addDays } from "../../lib/util";

interface Referral {
  referrerArtistId: ID;
  referredArtistId: ID;
  createdAt: string;
  attributionExpiresAt?: string;
}

export class NetworkEffectAccelerator implements Module {
  meta = {
    id: "42.network-accelerator",
    name: "Network Effect Accelerator",
    version: "1.0.0",
    provides: ["referral_attribution", "collab_intel", "skill_routing", "rev_share"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("artist.referred", async (e) => {
      const referrerArtistId = (e.payload as any)?.referrerArtistId as ID | undefined;
      const referredArtistId = e.subject?.artistId;
      if (!referrerArtistId || !referredArtistId) return;

      const referral: Referral = {
        referrerArtistId,
        referredArtistId,
        createdAt: ctx.now(),
        attributionExpiresAt: addDays(ctx.now(), 180),
      };

      await ctx.store.set(`referral:${referredArtistId}`, referral);
    });

    ctx.events.subscribe("booking.service_requested", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;

      const serviceTag = (e.payload as any)?.serviceTag as string | undefined;
      if (!serviceTag) return;

      const partner = await ctx.store.get<ID>(`network:best_partner:${artistId}:${serviceTag}`);
      if (partner) {
        await ctx.events.publish({
          id: `evt_${Math.random()}`,
          type: "artist.surface_action",
          at: ctx.now(),
          subject: { artistId },
          payload: { kind: "partner_suggestion", partnerArtistId: partner, serviceTag },
        });
      }
    });
  }
}
