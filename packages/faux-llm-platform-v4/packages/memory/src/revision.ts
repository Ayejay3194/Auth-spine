import type { MemoryNote, MemoryStore } from "./types";

/**
 * Belief revision rules:
 * - Same key, newer, higher confidence => deprecate older notes for that key.
 * - If value conflicts (string inequality) and confidence is similar, keep both (ambiguity) by not deprecating.
 */
export async function revise(store: MemoryStore, incoming: MemoryNote): Promise<void> {
  const existing = await store.query({ key: incoming.key, limit: 50 });
  await store.put(incoming);

  for (const n of existing) {
    if (n.id === incoming.id) continue;
    if (n.value === incoming.value) {
      // same value, prefer newer by deprecating older if incoming is strong
      if (incoming.confidence >= Math.max(0.6, n.confidence)) {
        await store.deprecate(n.id, incoming.id);
      }
      continue;
    }

    // conflicting value:
    const confGap = incoming.confidence - n.confidence;
    if (confGap >= 0.25 && incoming.t > n.t) {
      await store.deprecate(n.id, incoming.id);
    }
  }
}

export function makeNote(args: Omit<MemoryNote, "id" | "t">): MemoryNote {
  return {
    id: "mem_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16),
    t: Date.now(),
    ...args
  };
}
