import type { MemoryNote, MemoryStore } from "./types";

export class InMemoryStore implements MemoryStore {
  private notes: MemoryNote[] = [];

  async put(note: MemoryNote): Promise<void> {
    this.notes.push(note);
  }

  async query(q: { key?: string; contains?: string; limit?: number }): Promise<MemoryNote[]> {
    const lim = q.limit ?? 20;
    const contains = (q.contains ?? "").toLowerCase();
    const out = this.notes
      .filter(n => !n.deprecatedBy)
      .filter(n => q.key ? n.key === q.key : true)
      .filter(n => contains ? (n.value.toLowerCase().includes(contains) || n.key.toLowerCase().includes(contains)) : true)
      .sort((a, b) => (b.confidence - a.confidence) || (b.t - a.t))
      .slice(0, lim);
    return out;
  }

  async deprecate(noteId: string, byNoteId: string): Promise<void> {
    const n = this.notes.find(x => x.id === noteId);
    if (n) n.deprecatedBy = byNoteId;
  }

  async prune(nowMs: number): Promise<void> {
    this.notes = this.notes.filter(n => n.expiresAt == null || n.expiresAt > nowMs);
  }
}
