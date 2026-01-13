/**
 * Example DB-backed auth log adapter.
 */

export type DbAuthLogRow = {
  id: string;
  type:
    | "login_failed"
    | "reset_failed"
    | "oauth_callback_error"
    | "jwt_validation_error"
    | "suspicious_admin_login"
    | "tenant_leak_signal";
  occurred_at: Date;
  tenant_id?: string;
  user_id?: string;
  provider?: string;
};

export async function getAuthLogEventsFromDb(
  db: { query: (sql: string, params?: any[]) => Promise<{ rows: any[] }> },
  sinceMs: number
) {
  const sinceIso = new Date(sinceMs).toISOString();
  const res = await db.query(
    `
    SELECT id, type, occurred_at, tenant_id, user_id, provider
    FROM auth_ops_logs
    WHERE occurred_at >= $1
    ORDER BY occurred_at DESC
    `,
    [sinceIso]
  );

  return res.rows.map((r) => ({
    type: r.type,
    ts: new Date(r.occurred_at).getTime(),
    tenant_id: r.tenant_id ?? undefined,
    user_id: r.user_id ?? undefined,
    provider: r.provider ?? undefined,
  }));
}
