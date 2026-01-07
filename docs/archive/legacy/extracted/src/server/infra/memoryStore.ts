export class MemoryKV<T> {
  private map = new Map<string, { value: T; expiresAt?: number }>();

  get(key: string): T | null {
    const v = this.map.get(key);
    if (!v) return null;
    if (v.expiresAt && Date.now() > v.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return v.value;
  }

  set(key: string, value: T, ttlSeconds?: number) {
    this.map.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined });
  }

  delete(key: string) {
    this.map.delete(key);
  }

  keys(prefix?: string) {
    const out: string[] = [];
    for (const k of this.map.keys()) if (!prefix || k.startsWith(prefix)) out.push(k);
    return out;
  }
}
