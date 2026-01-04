import { newId } from "@/src/server/core/id";
import type { ProfessionalRepo } from "./professional.repo";
import type { Professional } from "./professional.types";

export class InMemoryProfessionalRepo implements ProfessionalRepo {
  private pros = new Map<string, Professional>();

  async getById(id: string): Promise<Professional | null> {
    return this.pros.get(id) ?? null;
  }

  async list(): Promise<Professional[]> {
    return [...this.pros.values()].sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
  }

  async create(p: Omit<Professional, "id" | "createdAt" | "updatedAt">): Promise<Professional> {
    const now = new Date().toISOString();
    const pro: Professional = { ...p, id: newId("pro"), createdAt: now, updatedAt: now };
    this.pros.set(pro.id, pro);
    return pro;
  }

  async update(id: string, patch: Partial<Professional>): Promise<void> {
    const p = this.pros.get(id);
    if (!p) return;
    this.pros.set(id, { ...p, ...patch, updatedAt: new Date().toISOString() });
  }
}
