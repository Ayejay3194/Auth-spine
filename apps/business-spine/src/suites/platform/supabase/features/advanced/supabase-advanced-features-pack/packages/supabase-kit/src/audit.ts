import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.register"
  | "auth.password_reset.request"
  | "auth.password_reset.complete"
  | "booking.create"
  | "booking.cancel"
  | "order.delivery.upload"
  | "admin.impersonate"
  | "admin.role_change";

export interface AuditEvent {
  action: AuditAction;
  actorUserId?: string | null;
  targetUserId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Writes append-only audit events.
 * Requires an `audit_log` table (see `sql/audit.sql`).
 */
export async function writeAudit(
  sb: SupabaseClient,
  event: AuditEvent
): Promise<void> {
  const { error } = await sb.from("audit_log").insert({
    action: event.action,
    actor_user_id: event.actorUserId ?? null,
    target_user_id: event.targetUserId ?? null,
    entity_type: event.entityType ?? null,
    entity_id: event.entityId ?? null,
    ip: event.ip ?? null,
    user_agent: event.userAgent ?? null,
    metadata: event.metadata ?? null,
  });

  if (error) throw error;
}
