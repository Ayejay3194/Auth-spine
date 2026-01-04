import type { Result, Vertical } from "@/src/server/core/types";
import type { ProfessionalRepo } from "./professional.repo";
import { VerticalRegistry } from "@/src/server/modules/verticals/vertical.registry";

export class ProfessionalService {
  constructor(private repo: ProfessionalRepo, private verticals: VerticalRegistry) {}

  async onboard(input: {
    vertical: Vertical;
    businessName: string;
    phoneE164?: string;
    email?: string;
    requiredFields?: Record<string, string>;
  }): Promise<Result<{ professionalId: string }>> {
    const cfg = this.verticals.get(input.vertical);
    if (!cfg.ok) return cfg as any;

    const rf = input.requiredFields ?? {};
    const missing = cfg.value.required_fields.filter(k => !rf[k]);
    if (missing.length) {
      return { ok: false, error: { kind: "VALIDATION", message: `Missing required fields: ${missing.join(", ")}` } };
    }

    const pro = await this.repo.create({
      vertical: input.vertical,
      businessName: input.businessName,
      phoneE164: input.phoneE164,
      email: input.email,
      requiredFields: rf
    });

    return { ok: true, value: { professionalId: pro.id } };
  }
}
