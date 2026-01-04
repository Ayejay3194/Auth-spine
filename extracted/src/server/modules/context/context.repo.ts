import type { BookingSession } from "./context.types";

export interface ContextRepo {
  get(phoneE164: string): Promise<BookingSession | null>;
  set(phoneE164: string, session: BookingSession, ttlSeconds: number): Promise<void>;
}
