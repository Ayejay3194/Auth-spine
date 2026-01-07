import type { ISODateTime } from "../core/types.js";

export type GhostBookingProposal = { proposedStartAtUtc: ISODateTime; message: string };

export class GhostBooking {
  detectPassiveIntent(text: string): boolean {
    return /(need|want|should|get|book).*\b(appointment|session|cut|color|training|tutor|cleaning|consult)\b/i.test(text)
      || /(need|want|should|get).*\b(haircut|massage|trainer|tutor|cleaning|taxes|therapy)\b/i.test(text);
  }

  propose(utcNow: ISODateTime): GhostBookingProposal {
    const start = new Date(Date.parse(utcNow) + 72 * 3600 * 1000).toISOString();
    return { proposedStartAtUtc: start, message: `I’m booking you for ${start}. Reply STOP if that doesn’t work.` };
  }

  finalizeNoReply(): { confirmed: true; message: string } {
    return { confirmed: true, message: "Cool, you’re booked. See you then." };
  }
}
