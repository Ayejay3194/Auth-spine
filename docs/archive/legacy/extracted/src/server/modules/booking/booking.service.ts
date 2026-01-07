import type { Result } from "@/src/server/core/types";
import type { EventBus } from "@/src/server/core/eventBus";
import type { BookingRepo } from "./booking.repo";
import type { CreateBookingInput } from "./booking.types";

export class BookingService {
  constructor(private repo: BookingRepo, private bus: EventBus) {}

  async createBooking(input: CreateBookingInput): Promise<Result<{ bookingId: string }>> {
    const lockKey = `lock:booking:${input.professionalId}:${input.startAt}:${input.endAt}`;
    const locked = await this.repo.acquireLock(lockKey, 60);
    if (!locked) return { ok: false, error: { kind: "CONFLICT", message: "Slot is being booked right now" } };

    try {
      const conflict = await this.repo.hasConflict(input.professionalId, input.startAt, input.endAt);
      if (conflict) return { ok: false, error: { kind: "CONFLICT", message: "Slot already booked" } };

      const booking = await this.repo.create(input);

      await this.bus.publish({
        type: "booking.created",
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        payload: { booking }
      });

      return { ok: true, value: { bookingId: booking.id } };
    } finally {
      await this.repo.releaseLock(lockKey);
    }
  }
}
