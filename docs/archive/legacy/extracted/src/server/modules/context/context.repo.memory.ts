import type { ContextRepo } from "./context.repo";
import type { BookingSession } from "./context.types";
import { MemoryKV } from "@/src/server/infra/memoryStore";

export class InMemoryContextRepo implements ContextRepo {
  private kv = new MemoryKV<BookingSession>();

  async get(phoneE164: string): Promise<BookingSession | null> {
    return this.kv.get(phoneE164);
  }

  async set(phoneE164: string, session: BookingSession, ttlSeconds: number): Promise<void> {
    this.kv.set(phoneE164, session, ttlSeconds);
  }
}
