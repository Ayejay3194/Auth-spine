import type { ID, ISODateTime, BookingStatus, Money, Vertical } from "@/src/server/core/types";

export type Booking = {
  id: ID;
  professionalId: ID;
  clientId: ID;
  serviceId: ID;
  vertical: Vertical;
  startAt: ISODateTime;
  endAt: ISODateTime;
  status: BookingStatus;
  deposit?: Money;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type CreateBookingInput = {
  professionalId: ID;
  clientId: ID;
  serviceId: ID;
  vertical: Vertical;
  startAt: ISODateTime;
  endAt: ISODateTime;
  requestedVia: "SMS" | "WEB" | "PRO_APP";
};

export type BookingLockKey = string;
