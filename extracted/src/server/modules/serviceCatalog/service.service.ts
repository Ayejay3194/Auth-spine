import type { Result, LocationType } from "@/src/server/core/types";
import type { ServiceRepo } from "./service.repo";
import type { ProfessionalRepo } from "@/src/server/modules/professional/professional.repo";
import { VerticalRegistry } from "@/src/server/modules/verticals/vertical.registry";

export class ServiceCatalogService {
  constructor(
    private services: ServiceRepo,
    private pros: ProfessionalRepo,
    private verticals: VerticalRegistry
  ) {}

  async createService(input: {
    professionalId: string;
    name: string;
    durationMin: number;
    priceCents: number;
    currency?: "usd";
    locationType: LocationType;
    metadata?: Record<string, unknown>;
  }): Promise<Result<{ serviceId: string }>> {
    const pro = await this.pros.getById(input.professionalId);
    if (!pro) return { ok: false, error: { kind: "NOT_FOUND", message: "Professional not found" } };

    const cfg = this.verticals.get(pro.vertical);
    if (!cfg.ok) return cfg as any;

    const svc = await this.services.create({
      professionalId: pro.id,
      vertical: pro.vertical,
      name: input.name,
      durationMin: input.durationMin,
      price: { amount: input.priceCents, currency: input.currency ?? "usd" },
      locationType: input.locationType,
      metadata: input.metadata ?? {}
    });

    return { ok: true, value: { serviceId: svc.id } };
  }

  async seedDefaultsForProfessional(professionalId: string): Promise<Result<{ created: number }>> {
    const pro = await this.pros.getById(professionalId);
    if (!pro) return { ok: false, error: { kind: "NOT_FOUND", message: "Professional not found" } };
    const cfg = this.verticals.get(pro.vertical);
    if (!cfg.ok) return cfg as any;

    let created = 0;
    for (const t of cfg.value.service_templates) {
      await this.services.create({
        professionalId: pro.id,
        vertical: pro.vertical,
        name: t.name,
        durationMin: t.default_duration_min,
        price: { amount: t.default_price_cents, currency: "usd" },
        locationType: t.location_type,
        metadata: (t.metadata ?? {}) as any
      });
      created++;
    }
    return { ok: true, value: { created } };
  }
}
