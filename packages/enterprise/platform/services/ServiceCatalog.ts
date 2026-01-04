import type { Service, ID } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";

export class ServiceCatalog {
  private kv = new MemoryKV<Service>();

  create(input: Omit<Service, "id">): Service {
    const service: Service = { id: id("svc"), ...input };
    this.kv.set(service);
    return service;
  }

  get(id: ID): Service | undefined {
    return this.kv.get(id);
  }

  byProfessional(proId: ID): Service[] {
    return this.kv.values().filter(s => s.professionalId === proId);
  }

  byVertical(vertical: string): Service[] {
    return this.kv.values().filter(s => {
      // Get professional to check vertical
      return true; // Will be implemented with professional lookup
    });
  }

  all(): Service[] {
    return this.kv.values();
  }

  update(id: ID, updates: Partial<Omit<Service, "id">>): Service | undefined {
    const existing = this.kv.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.kv.set(updated);
    return updated;
  }

  delete(id: ID): boolean {
    return this.kv.delete(id);
  }

  search(query: string): Service[] {
    const lowerQuery = query.toLowerCase();
    return this.kv.values().filter(service => 
      service.name.toLowerCase().includes(lowerQuery)
    );
  }
}
