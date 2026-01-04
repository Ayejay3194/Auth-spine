import type { ID } from "./types.js";

export class MemoryKV<T extends { id: ID }> {
  private map = new Map<ID, T>();
  get(id: ID) { return this.map.get(id); }
  set(value: T) { this.map.set(value.id, value); }
  delete(id: ID) { this.map.delete(id); }
  values() { return [...this.map.values()]; }
}
