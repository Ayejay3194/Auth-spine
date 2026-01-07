import type { Professional } from "./professional.types";

export interface ProfessionalRepo {
  getById(id: string): Promise<Professional | null>;
  create(p: Omit<Professional, "id" | "createdAt" | "updatedAt">): Promise<Professional>;
  update(id: string, patch: Partial<Professional>): Promise<void>;
  list(): Promise<Professional[]>;
}
