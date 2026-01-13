import type { FeatureFlag, FeatureFlagChange } from "../ops/types.js";
import type { IFlagStore } from "./flag_store.js";

export class InMemoryFlagStore implements IFlagStore {
  private flags = new Map<string, FeatureFlag>();

  private key(k: string, tenantId?: string) {
    return tenantId ? `${tenantId}:${k}` : `global:${k}`;
  }

  async get(key: string, tenantId?: string): Promise<FeatureFlag | undefined> {
    return this.flags.get(this.key(key, tenantId));
  }

  async list(tenantId?: string): Promise<FeatureFlag[]> {
    const prefix = tenantId ? `${tenantId}:` : "global:";
    const out: FeatureFlag[] = [];
    for (const [k, v] of this.flags.entries()) {
      if (k.startsWith(prefix)) out.push(v);
    }
    return out;
  }

  async set(change: FeatureFlagChange): Promise<void> {
    const k = this.key(change.key, change.tenantId);
    const existing = this.flags.get(k);
    const type = (existing?.type ?? (typeof change.newValue === "boolean" ? "boolean" : typeof change.newValue === "number" ? "number" : typeof change.newValue === "string" ? "string" : "json")) as any;
    this.flags.set(k, { key: change.key, type, value: change.newValue });
  }
}
