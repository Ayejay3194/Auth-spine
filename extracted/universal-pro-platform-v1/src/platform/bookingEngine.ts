import type { Booking, ID, ISODateTime, Money, Service, Vertical } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";
import { AppError } from "../core/errors.js";

export type CreateBookingInput = {
  clientId: ID;
  professionalId: ID;
  service: Service;
  vertical: Vertical;
  startAtUtc: ISODateTime;
  endAtUtc: ISODateTime;
  total: Money;
  deposit?: Money;
};

export class BookingEngine {
  private kv = new MemoryKV<Booking>();
  private holds = new Map<string, ID>(); // pro|start -> bookingId

  hold(input: CreateBookingInput, nowUtc: ISODateTime): Booking {
    const key = `${input.professionalId}|${input.startAtUtc}`;
    if (this.holds.has(key)) throw new AppError("Slot is currently held.", "SLOT_HELD", 409);

    const b: Booking = {
      id: id("booking"),
      clientId: input.clientId,
      professionalId: input.professionalId,
      serviceId: input.service.id,
      vertical: input.vertical,
      startAtUtc: input.startAtUtc,
      endAtUtc: input.endAtUtc,
      status: "held",
      total: input.total,
      deposit: input.deposit,
      createdAtUtc: nowUtc,
    };
    this.kv.set(b);
    this.holds.set(key, b.id);
    return b;
  }

  confirm(bookingId: ID): Booking {
    const b = this.kv.get(bookingId);
    if (!b) throw new AppError("Booking not found.", "NOT_FOUND", 404);
    if (b.status !== "held") throw new AppError("Cannot confirm booking.", "INVALID_STATE", 409);
    b.status = "confirmed";
    this.kv.set(b);
    return b;
  }

  cancel(bookingId: ID): Booking {
    const b = this.kv.get(bookingId);
    if (!b) throw new AppError("Booking not found.", "NOT_FOUND", 404);
    b.status = "cancelled";
    this.kv.set(b);
    this.holds.delete(`${b.professionalId}|${b.startAtUtc}`);
    return b;
  }

  all() { return this.kv.values(); }
}
