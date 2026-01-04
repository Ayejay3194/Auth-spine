import type { Professional, ID, Vertical } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";
import { AppError } from "../core/errors.js";

export class ProfessionalStore {
  private kv = new MemoryKV<Professional>();
  private emailIndex = new Map<string, ID>();
  private verticalIndex = new Map<Vertical, ID[]>();

  create(input: Omit<Professional, "id">): Professional {
    // Check for existing email
    if (this.emailIndex.has(input.email)) {
      throw new AppError("Professional with this email already exists", "EMAIL_EXISTS", 409);
    }

    const professional: Professional = { id: id("pro"), ...input };
    this.kv.set(professional);
    this.emailIndex.set(input.email, professional.id);
    
    // Update vertical index
    const verticalList = this.verticalIndex.get(input.vertical) || [];
    verticalList.push(professional.id);
    this.verticalIndex.set(input.vertical, verticalList);
    
    return professional;
  }

  get(id: ID): Professional | undefined {
    return this.kv.get(id);
  }

  getByEmail(email: string): Professional | undefined {
    const professionalId = this.emailIndex.get(email);
    return professionalId ? this.kv.get(professionalId) : undefined;
  }

  byVertical(vertical: Vertical): Professional[] {
    const professionalIds = this.verticalIndex.get(vertical) || [];
    return professionalIds.map(id => this.kv.get(id)).filter(Boolean) as Professional[];
  }

  update(id: ID, updates: Partial<Omit<Professional, "id">>): Professional | undefined {
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

    // If vertical is being updated, update vertical index
    if (updates.vertical && updates.vertical !== existing.vertical) {
      const oldVerticalList = this.verticalIndex.get(existing.vertical) || [];
      const newVerticalList = this.verticalIndex.get(updates.vertical) || [];
      
      // Remove from old vertical
      const oldIndex = oldVerticalList.indexOf(id);
      if (oldIndex > -1) {
        oldVerticalList.splice(oldIndex, 1);
        this.verticalIndex.set(existing.vertical, oldVerticalList);
      }
      
      // Add to new vertical
      newVerticalList.push(id);
      this.verticalIndex.set(updates.vertical, newVerticalList);
    }

    const updated = { ...existing, ...updates };
    this.kv.set(updated);
    return updated;
  }

  delete(id: ID): boolean {
    const professional = this.kv.get(id);
    if (!professional) return false;

    this.emailIndex.delete(professional.email);
    
    // Update vertical index
    const verticalList = this.verticalIndex.get(professional.vertical) || [];
    const index = verticalList.indexOf(id);
    if (index > -1) {
      verticalList.splice(index, 1);
      this.verticalIndex.set(professional.vertical, verticalList);
    }
    
    return this.kv.delete(id);
  }

  all(): Professional[] {
    return this.kv.values();
  }

  search(query: string): Professional[] {
    const lowerQuery = query.toLowerCase();
    return this.kv.values().filter(professional => 
      professional.name.toLowerCase().includes(lowerQuery) ||
      professional.email.toLowerCase().includes(lowerQuery) ||
      professional.bio?.toLowerCase().includes(lowerQuery)
    );
  }

  exists(email: string): boolean {
    return this.emailIndex.has(email);
  }

  getVerticals(): Vertical[] {
    return Array.from(this.verticalIndex.keys());
  }
}
