import { DriftPolicy, DriftState, shouldDisableML } from "../guardrails/drift";
import { GateConfig } from "../guardrails/gates";

export interface MlPolicies {
  enabled: boolean;
  gate: GateConfig;
  drift: DriftPolicy;
}

export class PolicyEngine {
  constructor(private policies: MlPolicies) {}

  get(): MlPolicies {
    return this.policies;
  }

  update(next: Partial<MlPolicies>): void {
    this.policies = { ...this.policies, ...next };
  }

  // if drift says disable, flip it off
  applyDrift(state: DriftState): { disabled: boolean; reasons: string[] } {
    const res = shouldDisableML(state, this.policies.drift);
    if (res.disable) this.policies = { ...this.policies, enabled: false };
    return { disabled: res.disable, reasons: res.reasons };
  }
}
