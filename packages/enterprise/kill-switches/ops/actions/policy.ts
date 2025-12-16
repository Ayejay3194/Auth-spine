import { OpsActionRequest } from "../types/opsRuntime";

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

export function assertAllowed(req: OpsActionRequest) {
  if (!["admin", "ops", "system"].includes(req.actor.role)) {
    throw new Error("Actor role not permitted.");
  }

  for (const a of req.actions) {
    if (STEP_UP_REQUIRED.has(a.key)) {
      if (!req.step_up_token) {
        throw new Error(`Step-up required for ${a.key}`);
      }
    }
  }
}

/** Placeholder validation */
export async function validateStepUpToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  // TODO: verify token with your auth provider or session.
  return token.length >= 12;
}
