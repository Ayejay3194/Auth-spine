import type { KVStore } from "./types";

type Entry = { value: any; expiresAt?: number };

export class InMemoryStore implements KVStore {
  private m = new Map<string, Entry>();

  private purge(key: string) {
    const e = this.m.get(key);
    if (!e) return;
    if (e.expiresAt && Date.now() > e.expiresAt) this.m.delete(key);
  }

  async get<T>(key: string): Promise<T | null> {
    this.purge(key);
    const e = this.m.get(key);
    return e ? (e.value as T) : null;
  }

  async set<T>(key: string, value: T, opts?: { ttlSeconds?: number }): Promise<void> {
    const expiresAt = opts?.ttlSeconds ? Date.now() + opts.ttlSeconds * 1000 : undefined;
    this.m.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.m.delete(key);
  }

  async scan(prefix: string, limit = 100): Promise<string[]> {
    const keys: string[] = [];
    for (const k of this.m.keys()) {
      if (k.startsWith(prefix)) keys.push(k);
      if (keys.length >= limit) break;
    }
    return keys;
  }
}
