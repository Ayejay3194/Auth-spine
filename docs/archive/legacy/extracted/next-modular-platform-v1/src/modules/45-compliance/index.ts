import type { Module, ModuleContext, ID } from "../../core/types";
import type { ServiceListing } from "../../domain/entities";

interface ComplianceRuleResult {
  ok: boolean;
  flags: string[];
  severity: "warn" | "block";
}

export class ComplianceAutopilot implements Module {
  meta = {
    id: "45.compliance",
    name: "Compliance Autopilot",
    version: "1.0.0",
    provides: ["license_tracking", "service_restrictions", "photo_consent", "region_rules"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("artist.login", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;

      const exp = await ctx.store.get<string>(`artist:license_expires:${artistId}`);
      if (exp && new Date(exp).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30) {
        await ctx.events.publish({
          id: `evt_${Math.random()}`,
          type: "artist.surface_action",
          at: ctx.now(),
          subject: { artistId },
          payload: { kind: "license_expiring", expiresAt: exp },
        });
      }
    });

    ctx.events.subscribe("booking.service_requested", async (e) => {
      const artistId = e.subject?.artistId;
      const userId = e.subject?.userId;
      const listing = (e.payload as any)?.listing as ServiceListing | undefined;
      if (!artistId || !userId || !listing) return;

      const result = await this.checkServiceCompliance(ctx, artistId, listing);
      if (!result.ok && result.severity === "block") {
        await ctx.events.publish({
          id: `evt_${Math.random()}`,
          type: "booking.blocked",
          at: ctx.now(),
          subject: { artistId, userId },
          payload: { reason: "compliance", flags: result.flags },
        });
      }
    });

    ctx.events.subscribe("artist.photo_publish_requested", async (e) => {
      const artistId = e.subject?.artistId;
      const userId = e.subject?.userId;
      if (!artistId || !userId) return;

      const ok = ctx.privacy.hasConsent({ userId, artistId }, "photo_use_public");
      if (!ok) {
        await ctx.events.publish({
          id: `evt_${Math.random()}`,
          type: "artist.photo_publish_blocked",
          at: ctx.now(),
          subject: { artistId, userId },
          payload: { reason: "missing_consent" },
        });
      }
    });
  }

  private async checkServiceCompliance(ctx: ModuleContext, artistId: ID, listing: ServiceListing): Promise<ComplianceRuleResult> {
    const flags: string[] = [];

    const regionCode = (await ctx.store.get<string>(`artist:region:${artistId}`)) ?? "unknown";
    const licensedTypes = (await ctx.store.get<string[]>(`artist:license_types:${artistId}`)) ?? [];

    for (const req of listing.requiredLicenseTypes ?? []) {
      if (!licensedTypes.includes(req)) flags.push(`missing_license:${req}`);
    }

    const stateRules = (await ctx.store.get<Record<string, string[]>>(`rules:${regionCode}`)) ?? {};
    const blockedWords = stateRules["blocked_words"] ?? [];
    if (blockedWords.some((w) => listing.description.toLowerCase().includes(w.toLowerCase()))) {
      flags.push("blocked_description_content");
    }

    const ok = flags.length === 0;
    return { ok, flags, severity: ok ? "warn" : "block" };
  }
}
