import type { EventBus, Event } from "./types";

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<(e: Event) => Promise<void> | void>>();
  async publish<E extends Event>(event: E): Promise<void> {
    const set = this.handlers.get(event.type);
    if (!set || set.size === 0) return;
    await Promise.allSettled([...set].map((h) => Promise.resolve(h(event))));
  }
  subscribe(type: string, handler: (event: Event) => Promise<void> | void): () => void {
    const set = this.handlers.get(type) ?? new Set();
    set.add(handler);
    this.handlers.set(type, set);
    return () => { set.delete(handler); if (set.size === 0) this.handlers.delete(type); };
  }
}
