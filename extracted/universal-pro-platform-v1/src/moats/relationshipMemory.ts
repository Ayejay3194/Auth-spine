import type { ID } from "../core/types.js";

export type MemoryNote = { key: string; value: string; confidence: number; createdAtUtc: string };

export class RelationshipMemory {
  private mem = new Map<ID, MemoryNote[]>();

  add(clientId: ID, note: Omit<MemoryNote, "createdAtUtc">, atUtc: string) {
    const list = this.mem.get(clientId) ?? [];
    list.push({ ...note, createdAtUtc: atUtc });
    this.mem.set(clientId, list);
  }

  get(clientId: ID): MemoryNote[] { return this.mem.get(clientId) ?? []; }

  prefersMinimalTalk(clientId: ID): boolean {
    return this.get(clientId).some(n => n.key === "pref.small_talk" && ["no","false","minimal"].includes(n.value.toLowerCase()) && n.confidence >= 0.7);
  }
}
