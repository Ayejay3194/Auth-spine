import { OpsActionRequest } from "../types/opsRuntime";
import { createSecretKey } from "crypto";
import { jwtVerify } from "jose";

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

  for (const a of req.actions) {
    if (STEP_UP_REQUIRED.has(a.key)) {
      if (!req.step_up_token) {
        throw new Error(`Step-up required for ${a.key}`);
      }
      const valid = await validateStepUpToken(req.step_up_token, req.actor.actor_id);
      if (!valid) {
        throw new Error(`Invalid step-up token for ${a.key}`);
      }
    }
  }
}

/** Placeholder validation */
export async function validateStepUpToken(token: string | undefined, actorId?: string): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET missing for step-up validation.");
  }

  try {
    const { payload } = await jwtVerify(token, createSecretKey(Buffer.from(secret, "utf-8")));
    if (actorId && payload.sub && String(payload.sub) !== actorId) return false;
    return true;
  } catch {
    return false;
  }
}
