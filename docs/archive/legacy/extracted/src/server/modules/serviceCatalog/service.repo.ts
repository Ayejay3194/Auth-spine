import type { Service } from "./service.types";

export interface ServiceRepo {
  create(s: Omit<Service, "id" | "createdAt" | "updatedAt">): Promise<Service>;
  listByProfessional(professionalId: string): Promise<Service[]>;
  getById(id: string): Promise<Service | null>;
}
