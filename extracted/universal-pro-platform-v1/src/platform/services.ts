import type { Service, ID } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";

export class ServiceCatalog {
  private kv = new MemoryKV<Service>();

  create(input: Omit<Service, "id">): Service {
    const s: Service = { id: id("svc"), ...input };
    this.kv.set(s);
    return s;
  }

  get(id: ID) { return this.kv.get(id); }
  byProfessional(proId: ID) { return this.kv.values().filter(s => s.professionalId === proId); }
  all() { return this.kv.values(); }
}
