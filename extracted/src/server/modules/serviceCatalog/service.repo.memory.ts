import { newId } from "@/src/server/core/id";
import type { ServiceRepo } from "./service.repo";
import type { Service } from "./service.types";

export class InMemoryServiceRepo implements ServiceRepo {
  private services = new Map<string, Service>();

  async create(s: Omit<Service, "id" | "createdAt" | "updatedAt">): Promise<Service> {
    const now = new Date().toISOString();
    const svc: Service = { ...s, id: newId("svc"), createdAt: now, updatedAt: now };
    this.services.set(svc.id, svc);
    return svc;
  }

  async listByProfessional(professionalId: string): Promise<Service[]> {
    return [...this.services.values()].filter(s => s.professionalId === professionalId);
  }

  async getById(id: string): Promise<Service | null> {
    return this.services.get(id) ?? null;
  }
}
