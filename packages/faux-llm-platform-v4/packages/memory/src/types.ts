export interface MemoryNote {
  id: string;
  t: number;
  key: string;
  value: string;
  confidence: number; // 0..1
  source: "user" | "system" | "model" | "tool";
  expiresAt?: number;
  deprecatedBy?: string;
}

export interface MemoryStore {
  put(note: MemoryNote): Promise<void>;
  query(q: { key?: string; contains?: string; limit?: number }): Promise<MemoryNote[]>;
  deprecate(noteId: string, byNoteId: string): Promise<void>;
  prune(nowMs: number): Promise<void>;
}
