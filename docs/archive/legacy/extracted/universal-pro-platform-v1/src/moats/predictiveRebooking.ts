import type { ISODateTime } from "../core/types.js";

export class PredictiveRebooking {
  nextSlot(startAtUtc: ISODateTime, weeks: number = 6): ISODateTime {
    const d = new Date(startAtUtc);
    d.setDate(d.getDate() + weeks * 7);
    return d.toISOString();
  }
  message(nextAtUtc: ISODateTime): string {
    return `You’re booked for your next visit on ${nextAtUtc}. Reply CHANGE if you need a different time.`;
  }
}
