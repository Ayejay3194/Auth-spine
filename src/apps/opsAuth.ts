export type OpsSeverity = 0 | 1 | 2 | 3;

export type AuthIncidentType =
  | "FAILED_LOGINS_SPIKE"
  | "PASSWORD_RESET_FAILURES"
  | "EMAIL_VERIFICATION_FAILURES"
  | "OAUTH_CALLBACK_ERRORS"
  | "JWT_VALIDATION_ERRORS"
  | "SESSION_ANOMALIES"
  | "SUSPICIOUS_ADMIN_LOGIN"
  | "TENANT_LEAK_RISK";

export type OpsAuthEvent = {
  event_id: string;
  incident_type: AuthIncidentType;
  severity_guess: OpsSeverity;
  occurred_at: string; // ISO
  scope?: {
    tenant_id?: string;
    user_id?: string;
    cohort?: string;
  };
  metrics_snapshot?: Record<string, number>;
  recent_changes?: {
    deploy_sha?: string;
    version?: string;
    flags_changed?: string[];
    last_deploy_at?: string; // ISO
  };
  notes?: string;
};

export type OpsSpineResponse = {
  decision: string;
  steps: string[];
  risk_notes: string[];
  rollback_plan: string[];
  recommended_flags?: Array<{ key: string; value: boolean; reason: string }>;
  classification?: {
    sev: OpsSeverity;
    category: "AUTH_OPS" | "SECURITY" | "TENANCY" | "BILLING" | "QUALITY";
  };
};

export type AdminNotification = {
  channel: "email" | "webhook" | "log";
  to?: string;
  webhook_url?: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
};
