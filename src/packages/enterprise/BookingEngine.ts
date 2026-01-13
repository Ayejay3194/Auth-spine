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
    if (this.holds.has(key)) {
      throw new AppError("Slot is currently held.", "SLOT_HELD", 409);
    }

    const booking: Booking = {
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
    
    this.kv.set(booking);
    this.holds.set(key, booking.id);
    return booking;
  }

  confirm(bookingId: ID): Booking {
    const booking = this.kv.get(bookingId);
    if (!booking) {
      throw new AppError("Booking not found.", "NOT_FOUND", 404);
    }
    if (booking.status !== "held") {
      throw new AppError("Cannot confirm booking.", "INVALID_STATE", 409);
    }
    
    booking.status = "confirmed";
    this.kv.set(booking);
    return booking;
  }

  cancel(bookingId: ID): Booking {
    const booking = this.kv.get(bookingId);
    if (!booking) {
      throw new AppError("Booking not found.", "NOT_FOUND", 404);
    }
    
    booking.status = "cancelled";
    this.kv.set(booking);
    this.holds.delete(`${booking.professionalId}|${booking.startAtUtc}`);
    return booking;
  }

  complete(bookingId: ID): Booking {
    const booking = this.kv.get(bookingId);
    if (!booking) {
      throw new AppError("Booking not found.", "NOT_FOUND", 404);
    }
    if (booking.status !== "confirmed") {
      throw new AppError("Cannot complete booking.", "INVALID_STATE", 409);
    }
    
    booking.status = "completed";
    this.kv.set(booking);
    return booking;
  }

  get(bookingId: ID): Booking | undefined {
    return this.kv.get(bookingId);
  }

  byClient(clientId: ID): Booking[] {
    return this.kv.values().filter(b => b.clientId === clientId);
  }

  byProfessional(professionalId: ID): Booking[] {
    return this.kv.values().filter(b => b.professionalId === professionalId);
  }

  byStatus(status: Booking["status"]): Booking[] {
    return this.kv.values().filter(b => b.status === status);
  }

  inTimeRange(startUtc: ISODateTime, endUtc: ISODateTime): Booking[] {
    return this.kv.values().filter(b => 
      b.startAtUtc >= startUtc && b.startAtUtc <= endUtc
    );
  }

  all(): Booking[] {
    return this.kv.values();
  }

  isSlotAvailable(professionalId: ID, startAtUtc: ISODateTime, endAtUtc: ISODateTime): boolean {
    const key = `${professionalId}|${startAtUtc}`;
    if (this.holds.has(key)) return false;
    
    // Check for overlapping bookings
    return !this.kv.values().some(booking => 
      booking.professionalId === professionalId &&
      booking.status !== "cancelled" &&
      booking.startAtUtc < endAtUtc &&
      booking.endAtUtc > startAtUtc
    );
  }
}
