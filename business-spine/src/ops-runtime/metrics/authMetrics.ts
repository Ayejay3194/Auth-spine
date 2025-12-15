export type AuthLogEvent =
  | { type: "login_failed"; ts: number; tenant_id?: string; user_id?: string }
  | { type: "reset_failed"; ts: number; tenant_id?: string; user_id?: string }
  | { type: "oauth_callback_error"; ts: number; provider: string; tenant_id?: string }
  | { type: "jwt_validation_error"; ts: number; tenant_id?: string }
  | { type: "suspicious_admin_login"; ts: number; admin_id?: string }
  | { type: "tenant_leak_signal"; ts: number; tenant_id?: string };

export type AuthMetricSnapshot = {
  failed_logins_5m: number;
  reset_failures_15m: number;
  oauth_callback_errors_5m: number;
  jwt_validation_errors_5m: number;
  suspicious_admin_logins_1h: number;
  tenant_leak_suspected_5m: number;
};

/**
 * Compute a metrics snapshot from raw log events.
 * Plug your log source here (DB, ClickHouse, Cloud logs, etc.).
 */
export function computeAuthMetrics(events: AuthLogEvent[], nowMs: number = Date.now()): AuthMetricSnapshot {
  const w5m = nowMs - 5 * 60 * 1000;
  const w15m = nowMs - 15 * 60 * 1000;
  const w1h = nowMs - 60 * 60 * 1000;

  const in5m = events.filter(e => e.ts >= w5m);
  const in15m = events.filter(e => e.ts >= w15m);
  const in1h = events.filter(e => e.ts >= w1h);

  return {
    failed_logins_5m: in5m.filter(e => e.type === "login_failed").length,
    reset_failures_15m: in15m.filter(e => e.type === "reset_failed").length,
    oauth_callback_errors_5m: in5m.filter(e => e.type === "oauth_callback_error").length,
    jwt_validation_errors_5m: in5m.filter(e => e.type === "jwt_validation_error").length,
    suspicious_admin_logins_1h: in1h.filter(e => e.type === "suspicious_admin_login").length,
    tenant_leak_suspected_5m: in5m.filter(e => e.type === "tenant_leak_signal").length,
  };
}
