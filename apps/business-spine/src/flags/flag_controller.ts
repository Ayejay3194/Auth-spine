import type { Environment, FeatureFlagChange, UserId } from "../ops/types.js";
import type { IFlagStore } from "./flag_store.js";

export class FeatureFlagController {
  constructor(private store: IFlagStore, private env: Environment) {}

  async setFlag(params: {
    key: string;
    newValue: any;
    actorUserId: UserId;
    tenantId?: string;
    reason?: string;
  }) {
    const old = await this.store.get(params.key, params.tenantId);
    const change: FeatureFlagChange = {
      key: params.key,
      oldValue: old?.value,
      newValue: params.newValue,
      actorUserId: params.actorUserId,
      tsISO: new Date().toISOString(),
      env: this.env,
      tenantId: params.tenantId,
      reason: params.reason
    };
    await this.store.set(change);
    return change;
  }

  async getBool(key: string, tenantId?: string, fallback = false): Promise<boolean> {
    const f = await this.store.get(key, tenantId);
    return f?.type === "boolean" ? Boolean(f.value) : fallback;
  }
}
