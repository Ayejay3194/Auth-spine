import { OpsActionRequest, OpsActionResult } from "../../types-ops/opsRuntime";
import { assertAllowed, validateStepUpToken } from "./policy";
import { getFlag, setFlag } from "./flagStore";
import { appendAudit, newAuditId } from "./auditLog";

export async function runOpsActions(req: OpsActionRequest, request_id?: string): Promise<OpsActionResult> {
  const audit_id = newAuditId();
  const applied: OpsActionResult["applied"] = [];
  const blocked: OpsActionResult["blocked"] = [];

  try {
    assertAllowed(req);

    if (req.step_up_token) {
      const ok = await validateStepUpToken(req.step_up_token);
      if (!ok) throw new Error("Invalid step-up token.");
    }

    for (const a of req.actions) {
      if (a.key === "auth.oauth.disableProvider") {
        // store provider config under a single key for now
        const key = "auth.oauth.providers";
        const before = getFlag(key) ?? {};
        const after = { ...(before as any), [a.value.provider]: a.value.enabled };
        setFlag(key, after);
        applied.push({ key, before, after });
        continue;
      }

      const before = getFlag(a.key);
      const res = setFlag(a.key, a.value);
      applied.push({ key: a.key, before: res.before, after: res.after });
    }

    const result: OpsActionResult = { ok: true, applied, blocked, audit_id };
    appendAudit({ audit_id, ts: new Date().toISOString(), request_id, request: req, result });
    return result;
  } catch (e: any) {
    const result: OpsActionResult = { ok: false, applied, blocked: [{ key: "*", reason: e?.message ?? "Blocked" }], audit_id };
    appendAudit({ audit_id, ts: new Date().toISOString(), request_id, request: req, result });
    return result;
  }
}
