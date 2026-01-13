import type { ClientProfile, ID } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";
import { AppError } from "../core/errors.js";

export class ClientStore {
  private kv = new MemoryKV<ClientProfile>();
  private emailIndex = new Map<string, ID>();

  create(input: Omit<ClientProfile, "id">): ClientProfile {
    // Check for existing email
    if (this.emailIndex.has(input.email)) {
      throw new AppError("Client with this email already exists", "EMAIL_EXISTS", 409);
    }

    const client: ClientProfile = { id: id("client"), ...input };
    this.kv.set(client);
    this.emailIndex.set(input.email, client.id);
    return client;
  }

  get(id: ID): ClientProfile | undefined {
    return this.kv.get(id);
  }

  getByEmail(email: string): ClientProfile | undefined {
    const clientId = this.emailIndex.get(email);
    return clientId ? this.kv.get(clientId) : undefined;
  }

  update(id: ID, updates: Partial<Omit<ClientProfile, "id">>): ClientProfile | undefined {
    const existing = this.kv.get(id);
    if (!existing) return undefined;

    // If email is being updated, update the index
    if (updates.email && updates.email !== existing.email) {
      if (this.emailIndex.has(updates.email)) {
        throw new AppError("Email already exists", "EMAIL_EXISTS", 409);
      }
      this.emailIndex.delete(existing.email);
      this.emailIndex.set(updates.email, id);
    }

    const updated = { ...existing, ...updates };
    this.kv.set(updated);
    return updated;
  }

  delete(id: ID): boolean {
    const client = this.kv.get(id);
    if (!client) return false;

    this.emailIndex.delete(client.email);
    return this.kv.delete(id);
  }

  all(): ClientProfile[] {
    return this.kv.values();
  }

  search(query: string): ClientProfile[] {
    const lowerQuery = query.toLowerCase();
    return this.kv.values().filter(client => 
      client.name.toLowerCase().includes(lowerQuery) ||
      client.email.toLowerCase().includes(lowerQuery)
    );
  }

  exists(email: string): boolean {
    return this.emailIndex.has(email);
  }
}
