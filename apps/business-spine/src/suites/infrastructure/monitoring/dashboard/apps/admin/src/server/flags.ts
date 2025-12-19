export type FlagKey =
  | "module.executive"
  | "module.finance"
  | "module.pos"
  | "module.payroll"
  | "module.scheduling"
  | "module.inventory"
  | "module.vendors"
  | "module.compliance"
  | "module.reports";

type FlagMap = Record<FlagKey, boolean>;

const GLOBAL_FLAGS: FlagMap = {
  "module.executive": true,
  "module.finance": true,
  "module.pos": true,
  "module.payroll": true,
  "module.scheduling": true,
  "module.inventory": true,
  "module.vendors": true,
  "module.compliance": true,
  "module.reports": true
};

export async function isEnabled(key: FlagKey, tenantId?: string): Promise<boolean> {
  void tenantId;
  return GLOBAL_FLAGS[key];
}
