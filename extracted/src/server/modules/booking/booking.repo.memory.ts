import { newId } from "@/src/server/core/id";
import type { BookingRepo } from "./booking.repo";
import type { Booking, CreateBookingInput, BookingLockKey } from "./booking.types";
import { MemoryKV } from "@/src/server/infra/memoryStore";

export class InMemoryBookingRepo implements BookingRepo {
  private bookings = new Map<string, Booking>();
  private locks = new MemoryKV<true>();

  async create(input: CreateBookingInput): Promise<Booking> {
    const now = new Date().toISOString();
    const b: Booking = {
      id: newId("booking"),
      professionalId: input.professionalId,
      clientId: input.clientId,
      serviceId: input.serviceId,
      vertical: input.vertical,
      startAt: input.startAt,
      endAt: input.endAt,
      status: "CONFIRMED",
      createdAt: now,
      updatedAt: now
    };
    this.bookings.set(b.id, b);
    return b;
  }

  async getById(id: string): Promise<Booking | null> {
    return this.bookings.get(id) ?? null;
  }

  async cancel(id: string): Promise<void> {
    const b = this.bookings.get(id);
    if (!b) return;
    this.bookings.set(id, { ...b, status: "CANCELLED", updatedAt: new Date().toISOString() });
  }

  async listByClient(clientId: string): Promise<Booking[]> {
    return [...this.bookings.values()]
      .filter(b => b.clientId === clientId)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  async listByProfessional(professionalId: string): Promise<Booking[]> {
    return [...this.bookings.values()]
      .filter(b => b.professionalId === professionalId)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  async hasConflict(professionalId: string, startAt: string, endAt: string): Promise<boolean> {
    const s = Date.parse(startAt);
    const e = Date.parse(endAt);
    return [...this.bookings.values()].some(b => {
      if (b.professionalId !== professionalId) return false;
      if (b.status === "CANCELLED") return false;
      const bs = Date.parse(b.startAt);
      const be = Date.parse(b.endAt);
      return Math.max(s, bs) < Math.min(e, be);
    });
  }

  async acquireLock(key: BookingLockKey, ttlSeconds: number): Promise<boolean> {
    if (this.locks.get(key)) return false;
    this.locks.set(key, true, ttlSeconds);
    return true;
  }

  async releaseLock(key: BookingLockKey): Promise<void> {
    this.locks.delete(key);
  }
}
