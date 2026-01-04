import type { ContextRepo } from "./context.repo";
import type { BookingSession } from "./context.types";

export class ContextService {
  constructor(private repo: ContextRepo) {}

  async getOrCreate(phoneE164: string): Promise<BookingSession> {
    return (await this.repo.get(phoneE164)) ?? {
      phoneE164,
      stage: "NEW",
      updatedAt: new Date().toISOString()
    };
  }

  async patch(phoneE164: string, patch: Partial<BookingSession>) {
    const curr = await this.getOrCreate(phoneE164);
    const next: BookingSession = { ...curr, ...patch, updatedAt: new Date().toISOString() };
    await this.repo.set(phoneE164, next, 60 * 30);
    return next;
  }

  async reset(phoneE164: string) {
    await this.patch(phoneE164, {
      stage: "NEW",
      detectedVertical: undefined,
      verticalConfidence: undefined,
      professionalId: undefined,
      serviceId: undefined,
      intake: undefined,
      proposedSlots: undefined,
      pendingSlot: undefined
    });
  }
}
