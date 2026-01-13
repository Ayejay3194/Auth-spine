export class MemoryKV<T> {
  private map = new Map<string, T>();

  set(item: { id: string } & T): void {
    this.map.set(item.id, item);
  }

  get(id: string): T | undefined {
    return this.map.get(id);
  }

  values(): T[] {
    return Array.from(this.map.values());
  }

  delete(id: string): boolean {
    return this.map.delete(id);
  }

  clear(): void {
    this.map.clear();
  }

  size(): number {
    return this.map.size;
  }

  has(id: string): boolean {
    return this.map.has(id);
  }

  find(predicate: (value: T) => boolean): T | undefined {
    return this.values().find(predicate);
  }

  filter(predicate: (value: T) => boolean): T[] {
    return this.values().filter(predicate);
  }
}
