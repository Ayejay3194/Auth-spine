import { jwtVerify } from "jose";
import { OpsActionRequest } from "../types/opsRuntime";
import { verifySession } from "@/src/auth/session";

/**
 * Minimal policy:
 * - Some actions require step-up token (MFA / re-auth).
 * - Only admin/ops roles can run actions.
 * Replace step-up validation with your auth provider.
 */
const STEP_UP_REQUIRED = new Set<string>([
  "auth.forceLogoutAll",
  "auth.blockNewSignups",
  "auth.oauth.disableProvider",
]);

export async function assertAllowed(req: OpsActionRequest) {
  if (!["admin", "ops", "system"].includes(req.actor.role)) {
    throw new Error("Actor role not permitted.");
  }

  let stepUpValid: boolean | null = null;
  for (const a of req.actions) {
    if (STEP_UP_REQUIRED.has(a.key)) {
      if (stepUpValid === null) {
        stepUpValid = await validateStepUpToken(req.step_up_token, req.actor.actor_id);
      }
      if (!stepUpValid) {
        throw new Error(`Invalid step-up token for ${a.key}`);
      }
    }
  }
}

/** Step-up token validation */
export async function validateStepUpToken(token: string | undefined, actorId?: string): Promise<boolean> {
  if (!token) return false;
  const claims = await verifySession(token);
  if (!claims) return false;
  if (actorId && claims.sub !== actorId) return false;
  return true;
}
