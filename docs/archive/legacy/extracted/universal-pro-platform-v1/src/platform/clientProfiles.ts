import type { Client, ID } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";

export class ClientProfileStore {
  private kv = new MemoryKV<Client>();

  create(input: Partial<Omit<Client, "id" | "trustScore">> & { trustScore?: number }): Client {
    const c: Client = {
      id: id("client"),
      trustScore: input.trustScore ?? 50,
      phone: input.phone,
      email: input.email,
      name: input.name,
      paymentMethodRef: input.paymentMethodRef,
      preferences: input.preferences ?? {},
    };
    this.kv.set(c);
    return c;
  }

  get(id: ID) { return this.kv.get(id); }
  all() { return this.kv.values(); }

  adjustTrust(id: ID, delta: number) {
    const c = this.kv.get(id);
    if (!c) return;
    c.trustScore = Math.max(0, Math.min(100, c.trustScore + delta));
    this.kv.set(c);
  }
}
