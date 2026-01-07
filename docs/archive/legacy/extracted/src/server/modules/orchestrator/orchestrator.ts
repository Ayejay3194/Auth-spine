import type { EventBus } from "@/src/server/core/eventBus";
import { RemindersService } from "@/src/server/modules/reminders/reminders.service";

export class Orchestrator {
  constructor(private bus: EventBus, private reminders: RemindersService) {}

  wire() {
    this.bus.subscribe("booking.created", async (e) => {
      const bookingId = e.payload.booking.id as string;
      await this.reminders.scheduleForBooking(bookingId);
    });
  }
}
