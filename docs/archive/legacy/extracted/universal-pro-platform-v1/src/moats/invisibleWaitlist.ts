import type { ID } from "../core/types.js";

export class InvisibleWaitlist {
  private lists = new Map<string, ID[]>();

  join(key: string, clientId: ID) {
    const list = this.lists.get(key) ?? [];
    list.push(clientId);
    this.lists.set(key, list);
  }

  popNext(key: string): ID | undefined {
    const list = this.lists.get(key);
    return list?.shift();
  }

  size(key: string): number { return this.lists.get(key)?.length ?? 0; }
}
