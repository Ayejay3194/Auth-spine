export type UUID = string;
export type ISODateTime = string;

export type Environment = "dev" | "staging" | "prod";
export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type TenantId = string;
export type UserId = string;

export type Role = "staff" | "manager" | "admin" | "owner" | "system";

export type Money = { currency: "USD" | string; cents: number };

export type Receipt = {
  id: UUID;
  tsISO: ISODateTime;
  kind: "finance" | "payroll" | "pos" | "security" | "ops" | "inventory" | "vendor";
  tenantId?: TenantId;
  actorUserId?: UserId;
  reasonCode: string;
  confidence?: number;
  weight?: number;
  details?: Record<string, any>;
};

export type AuditAction =
  | "LOGIN" | "LOGOUT" | "ROLE_CHANGED" | "TENANT_SWITCHED"
  | "PAYMENT_REFUNDED" | "INVOICE_SENT" | "PAYROLL_RUN"
  | "SCHEDULE_EDIT" | "INVENTORY_ADJUST" | "VENDOR_CONTRACT_EDIT"
  | "FEATURE_FLAG_SET" | "DATA_EXPORT" | "APPROVAL_DECISION" | "ALERT_SENT";

export type AuditEntry = {
  id: UUID;
  tsISO: ISODateTime;
  env: Environment;
  tenantId?: TenantId;
  actorUserId?: UserId;
  subjectId?: string;
  action: AuditAction;
  surface: "admin" | "api" | "web";
  meta?: Record<string, any>;
};

export type KPI = { key: string; label: string; value: string; trend?: "up" | "down" | "flat" };
