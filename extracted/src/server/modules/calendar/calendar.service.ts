import type { BookingRepo } from "@/src/server/modules/booking/booking.repo";

export class CalendarService {
  constructor(private bookingRepo: BookingRepo) {}

  async getNextAvailableSlots(professionalId: string, count: number, durationMin: number) {
    const now = new Date();
    const day = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const slotA = new Date(day); slotA.setHours(14, 0, 0, 0);
    const slotB = new Date(day); slotB.setHours(16, 0, 0, 0);

    const candidates = [
      { label: label(slotA), startAt: slotA.toISOString(), endAt: new Date(slotA.getTime() + durationMin * 60 * 1000).toISOString() },
      { label: label(slotB), startAt: slotB.toISOString(), endAt: new Date(slotB.getTime() + durationMin * 60 * 1000).toISOString() }
    ];

    const out: typeof candidates = [];
    for (const c of candidates) {
      const conflict = await this.bookingRepo.hasConflict(professionalId, c.startAt, c.endAt);
      if (!conflict) out.push(c);
      if (out.length >= count) break;
    }
    return out;
  }
}

function label(d: Date) {
  const day = d.toLocaleDateString("en-US", { weekday: "long" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  return `${day} ${time}`;
}
