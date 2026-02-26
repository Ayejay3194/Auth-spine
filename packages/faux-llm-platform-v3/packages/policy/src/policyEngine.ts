export interface AppPolicy {
  appId: string;
  allowedTools: string[];
  maxRepairAttempts: number;
  maxContextChars: number;
  temperature: number;
}

export class PolicyEngine {
  constructor(private policy: AppPolicy) {}
  get(): AppPolicy { return this.policy; }
  update(next: Partial<AppPolicy>): void { this.policy = { ...this.policy, ...next }; }
  isToolAllowed(tool: string): boolean { return this.policy.allowedTools.includes(tool); }
}
