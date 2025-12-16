export type UUID = string;

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type Environment = "dev" | "staging" | "prod";

export type TenantId = string;
export type UserId = string;

export type Role =
  | "user"
  | "seller"
  | "buyer"
  | "moderator"
  | "admin"
  | "owner"
  | "system";

export type Receipt = {
  id: UUID;
  tsISO: string;
  kind: string;
  actorUserId?: UserId;
  subjectUserId?: UserId;
  tenantId?: TenantId;
  reasonCode: string;
  confidence?: number;
  weight?: number;
  details?: Record<string, any>;
};

export type Decision = {
  id: UUID;
  tsISO: string;
  tenantId?: TenantId;
  subjectUserId?: UserId;
  action: string;
  severity: Severity;
  receipts: { reasonCode: string; receiptIds: UUID[] }[];
  ttlSeconds?: number;
  notes?: string;
};

export type AuditAction =
  | "AUTH_LOGIN"
  | "AUTH_LOGOUT"
  | "AUTH_PASSWORD_RESET"
  | "AUTH_EMAIL_VERIFY"
  | "RBAC_ROLE_CHANGED"
  | "TENANT_SWITCH"
  | "FEATURE_FLAG_CHANGED"
  | "DATA_EXPORT"
  | "DATA_DELETE"
  | "PAYMENT_EVENT"
  | "ADMIN_IMPERSONATION"
  | "SECURITY_POLICY_DECISION"
  | "USER_REPORTED"
  | "USER_BLOCKED"
  | "SYSTEM_ALERT_SENT";

export type AuditEntry = {
  id: UUID;
  tsISO: string;
  env: Environment;
  tenantId?: TenantId;
  actorUserId?: UserId;
  subjectUserId?: UserId;
  action: AuditAction;
  surface: string;
  meta?: Record<string, any>;
};

export type Incident = {
  id: UUID;
  tsISO: string;
  env: Environment;
  severity: Severity;
  title: string;
  details: string;
  context?: Record<string, any>;
};

export type HealthStatus = {
  tsISO: string;
  env: Environment;
  ok: boolean;
  checks: { name: string; ok: boolean; detail?: string }[];
};

export type FeatureFlag =
  | { key: string; type: "boolean"; value: boolean }
  | { key: string; type: "number"; value: number }
  | { key: string; type: "string"; value: string }
  | { key: string; type: "json"; value: any };

export type FeatureFlagChange = {
  key: string;
  oldValue: any;
  newValue: any;
  actorUserId: UserId;
  tsISO: string;
  env: Environment;
  tenantId?: TenantId;
  reason?: string;
};


