import { AuthIncidentType, OpsAuthEvent } from "../types/opsAuth";

export type AuthMetricSnapshot = {
  failed_logins_5m?: number;
  reset_failures_15m?: number;
  oauth_callback_errors_5m?: number;
  jwt_validation_errors_5m?: number;
  suspicious_admin_logins_1h?: number;
  tenant_leak_suspected_5m?: number;
};

export function deriveAuthIncidents(
  metrics: AuthMetricSnapshot,
  context?: Partial<OpsAuthEvent>
): OpsAuthEvent[] {
  const now = new Date().toISOString();
  const events: OpsAuthEvent[] = [];

  const push = (incident_type: AuthIncidentType, sev: 0 | 1 | 2 | 3, notes: string, m: Record<string, number>) => {
    events.push({
      event_id: cryptoId(),
      incident_type,
      severity_guess: sev,
      occurred_at: now,
      metrics_snapshot: m,
      notes,
      ...context,
    });
  };

  if ((metrics.tenant_leak_suspected_5m ?? 0) > 0) {
    push("TENANT_LEAK_RISK", 0, "Potential cross-tenant access signal detected.", { tenant_leak_suspected_5m: metrics.tenant_leak_suspected_5m! });
  }

  if ((metrics.suspicious_admin_logins_1h ?? 0) >= 2) {
    push("SUSPICIOUS_ADMIN_LOGIN", 1, "Repeated suspicious admin logins in the last hour.", { suspicious_admin_logins_1h: metrics.suspicious_admin_logins_1h! });
  }

  if ((metrics.failed_logins_5m ?? 0) >= 50) {
    push("FAILED_LOGINS_SPIKE", 1, "Failed login spike threshold exceeded.", { failed_logins_5m: metrics.failed_logins_5m! });
  }

  if ((metrics.reset_failures_15m ?? 0) >= 10) {
    push("PASSWORD_RESET_FAILURES", 2, "Password reset failures elevated.", { reset_failures_15m: metrics.reset_failures_15m! });
  }

  if ((metrics.oauth_callback_errors_5m ?? 0) >= 10) {
    push("OAUTH_CALLBACK_ERRORS", 2, "OAuth callback errors elevated.", { oauth_callback_errors_5m: metrics.oauth_callback_errors_5m! });
  }

  if ((metrics.jwt_validation_errors_5m ?? 0) >= 25) {
    push("JWT_VALIDATION_ERRORS", 1, "JWT validation errors elevated.", { jwt_validation_errors_5m: metrics.jwt_validation_errors_5m! });
  }

  return events;
}

function cryptoId(): string {
  // Works in Node 18+ and modern runtimes
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    const cryptoWithUUID = crypto as { randomUUID: () => string };
    return cryptoWithUUID.randomUUID();
  }
  return "evt_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}
