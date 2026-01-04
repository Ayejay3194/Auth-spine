import type { Client } from "./client.types";

export interface ClientRepo {
  findByPhone(phoneE164: string): Promise<Client | null>;
  createFromPhone(phoneE164: string, patch?: Partial<Client>): Promise<Client>;
  update(id: string, patch: Partial<Client>): Promise<void>;
}
