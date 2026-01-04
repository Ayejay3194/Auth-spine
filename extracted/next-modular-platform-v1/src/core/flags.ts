import type { FeatureFlags } from "./types";

export class SimpleFlags implements FeatureFlags {
  constructor(private on: Set<string> = new Set()) {}
  enabled(key: string): boolean {
    return this.on.has(key);
  }
}
