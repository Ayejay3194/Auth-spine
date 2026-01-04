import type { Booking, CreateBookingInput, BookingLockKey } from "./booking.types";

export interface BookingRepo {
  create(input: CreateBookingInput): Promise<Booking>;
  getById(id: string): Promise<Booking | null>;
  cancel(id: string, reason?: string): Promise<void>;
  hasConflict(professionalId: string, startAt: string, endAt: string): Promise<boolean>;
  listByClient(clientId: string): Promise<Booking[]>;
  listByProfessional(professionalId: string): Promise<Booking[]>;

  acquireLock(key: BookingLockKey, ttlSeconds: number): Promise<boolean>;
  releaseLock(key: BookingLockKey): Promise<void>;
}
