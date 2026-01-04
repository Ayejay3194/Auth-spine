import { newId } from "@/src/server/core/id";
import type { ClientRepo } from "./client.repo";
import type { Client } from "./client.types";

export class InMemoryClientRepo implements ClientRepo {
  private clients = new Map<string, Client>();

  async findByPhone(phoneE164: string): Promise<Client | null> {
    for (const c of this.clients.values()) if (c.phoneE164 === phoneE164) return c;
    return null;
  }

  async createFromPhone(phoneE164: string, patch?: Partial<Client>): Promise<Client> {
    const now = new Date().toISOString();
    const c: Client = {
      id: newId("client"),
      phoneE164,
      email: patch?.email,
      name: patch?.name,
      birthday: patch?.birthday,
      relationshipState: "NEW",
      createdAt: now,
      updatedAt: now
    };
    this.clients.set(c.id, c);
    return c;
  }

  async update(id: string, patch: Partial<Client>): Promise<void> {
    const c = this.clients.get(id);
    if (!c) return;
    this.clients.set(id, { ...c, ...patch, updatedAt: new Date().toISOString() });
  }
}
