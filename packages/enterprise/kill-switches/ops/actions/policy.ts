import { jwtVerify } from "jose";
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

export async function assertAllowed(req: OpsActionRequest) {
  if (!["admin", "ops", "system"].includes(req.actor.role)) {
    throw new Error("Actor role not permitted.");
  }

  let stepUpValid: boolean | null = null;
  for (const a of req.actions) {
    if (STEP_UP_REQUIRED.has(a.key)) {
      if (stepUpValid === null) {
        stepUpValid = await validateStepUpToken(req.step_up_token);
      }
      if (!stepUpValid) throw new Error(`Step-up required for ${a.key}`);
    }
  }
}

/** Step-up JWT validation */
export async function validateStepUpToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const issuer = process.env.STEP_UP_ISSUER ?? process.env.ISSUER ?? "http://localhost:4000";
  const audience = process.env.STEP_UP_AUDIENCE ?? process.env.JWT_AUDIENCE ?? "ops";
  const secret = process.env.STEP_UP_JWT_SECRET ?? process.env.JWT_SECRET ?? "dev_secret_change_me";

  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key, { issuer, audience, algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}
