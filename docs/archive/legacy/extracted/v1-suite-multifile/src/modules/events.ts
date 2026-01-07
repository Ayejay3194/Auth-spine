import type { ID, ISODateTime, Money } from "../core/types.js";

export type Event =
  | { type: "identity.followed"; atUtc: ISODateTime; clientId: ID; artistId: ID }
  | { type: "identity.unfollowed"; atUtc: ISODateTime; clientId: ID; artistId: ID }
  | { type: "booking.created"; atUtc: ISODateTime; bookingId: ID; clientId: ID; artistId: ID; total: Money }
  | { type: "message.sent"; atUtc: ISODateTime; messageId: ID; channel: string }
  | { type: "pricing.quoted"; atUtc: ISODateTime; quoteId: ID; clientId: ID; artistId: ID; total: Money };
