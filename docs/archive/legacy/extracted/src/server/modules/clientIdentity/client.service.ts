import type { Result } from "@/src/server/core/types";
import type { ClientRepo } from "./client.repo";

export class ClientIdentityService {
  constructor(private repo: ClientRepo) {}

  async resolveClient(phoneE164: string, patch?: { name?: string; email?: string }): Promise<Result<{ clientId: string }>> {
    const existing = await this.repo.findByPhone(phoneE164);
    if (existing) return { ok: true, value: { clientId: existing.id } };
    const created = await this.repo.createFromPhone(phoneE164, patch);
    return { ok: true, value: { clientId: created.id } };
  }
}
