import type { AuditEntry, AuditAction, Environment, TenantId, UserId } from "../ops/types.js";
import { stableId } from "../utils/stable_id.js";

export function makeAuditEntry(params: Omit<AuditEntry, "id">): AuditEntry {
  return {
    ...params,
    id: stableId(`audit:${params.env}:${params.action}:${params.tenantId ?? "none"}:${params.subjectUserId ?? "none"}:${params.tsISO}`)
  };
}

export function auditMetaSafe(meta?: Record<string, any>): Record<string, any> | undefined {
  if (!meta) return undefined;
  // Basic safety: remove obviously sensitive keys if present
  const banned = new Set(["password", "token", "secret", "ssn", "cardNumber"]);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (!banned.has(k)) out[k] = v;
  }
  return out;
}

export type AuditParams = {
  tsISO: string;
  env: Environment;
  tenantId?: TenantId;
  actorUserId?: UserId;
  subjectUserId?: UserId;
  action: AuditAction;
  surface: string;
  meta?: Record<string, any>;
};
