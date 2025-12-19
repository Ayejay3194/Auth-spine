import type { FeatureFlag, FeatureFlagChange } from "../ops/types.js";

export interface IFlagStore {
  get(key: string, tenantId?: string): Promise<FeatureFlag | undefined>;
  list(tenantId?: string): Promise<FeatureFlag[]>;
  set(change: FeatureFlagChange): Promise<void>;
}
