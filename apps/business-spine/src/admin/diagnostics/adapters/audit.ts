import type { DiagContext, DiagResult } from "../types";

export type AuditWrite = (ev: {
  tenantId: string;
  actorId: string;
  role: string;
  type: string;
  details: Record<string, any>;
  at: string;
}) => Promise<void>;

/**
 * Default: no-op audit writer (warn).
 * Replace with your Prisma audit logger or log sink.
 */
export function getAuditWriter(): AuditWrite {
  return async () => {};
}

export async function checkAudit(ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  try {
    const write = getAuditWriter();
    const at = new Date().toISOString();
    await write({
      tenantId: ctx.tenantId,
      actorId: ctx.actorId,
      role: ctx.role,
      type: "diagnostics.run",
      details: { probe: true },
      at,
    });
    return { id: "audit", name: "Audit log write", status: "ok", ms: Date.now() - start, details: { wrote: true } };
  } catch (e: any) {
    return { id: "audit", name: "Audit log write", status: "fail", ms: Date.now() - start, details: { error: String(e?.message ?? e) } };
  }
}
