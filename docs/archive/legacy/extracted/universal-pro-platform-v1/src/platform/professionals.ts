import type { Professional, ID, Vertical } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";

export class ProfessionalStore {
  private kv = new MemoryKV<Professional>();

  create(input: Omit<Professional, "id">): Professional {
    const p: Professional = { id: id("pro"), ...input };
    this.kv.set(p);
    return p;
  }

  get(id: ID) { return this.kv.get(id); }
  byVertical(v: Vertical) { return this.kv.values().filter(p => p.vertical === v); }
  all() { return this.kv.values(); }
}
