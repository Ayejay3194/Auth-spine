import type { Module, ModuleContext, ID } from "../../core/types";
import type { ServiceListing } from "../../domain/entities";

export class InvisibleBrandGovernance implements Module {
  meta = {
    id: "41.brand-governance",
    name: "Invisible Brand Governance",
    version: "1.0.0",
    provides: ["copy_normalization", "visual_consistency", "prohibited_content_filter"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("artist.listing_submitted", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;

      const listing = e.payload as ServiceListing;
      const cleaned = this.normalizeCopy(listing);

      const autoApply = ctx.flags.enabled("brand.auto_apply_copy", { artistId });
      await ctx.events.publish({
        id: `evt_${Math.random()}`,
        type: autoApply ? "artist.listing_auto_corrected" : "artist.listing_suggestion",
        at: ctx.now(),
        subject: { artistId },
        payload: { before: listing, after: cleaned, changes: diffCopy(listing, cleaned) },
      });
    });
  }

  normalizeCopy(listing: ServiceListing): ServiceListing {
    const title = smartCap(listing.title.trim());
    let description = listing.description.trim();

    description = description.replace(/\balot\b/gi, "a lot");
    description = description.replace(/!!+/g, "!");
    description = description.replace(/\s{2,}/g, " ");

    return { ...listing, title, description };
  }
}

function smartCap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function diffCopy(a: ServiceListing, b: ServiceListing) {
  const changes: string[] = [];
  if (a.title !== b.title) changes.push("title_normalized");
  if (a.description !== b.description) changes.push("description_normalized");
  return changes;
}
