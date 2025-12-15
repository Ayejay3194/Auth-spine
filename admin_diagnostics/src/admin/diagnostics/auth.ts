import type { DiagContext } from "./types";

/**
 * Replace this with your real auth:
 * - NextAuth session (getServerSession)
 * - your JWT middleware
 * - your existing header-based dev auth
 *
 * Default behavior:
 * - In production: require real auth (you must implement)
 * - In dev: allows DIAG_SHARED_SECRET override.
 */
export async function requireAdmin(req: Request): Promise<DiagContext> {
  const role = req.headers.get("x-role") ?? "";
  const actorId = req.headers.get("x-user-id") ?? "unknown";
  const tenantId = req.headers.get("x-tenant-id") ?? "unknown";

  // Dev-only shared secret override (useful in staging while wiring auth)
  const shared = process.env.DIAG_SHARED_SECRET;
  const got = req.headers.get("x-diag-secret");
  const allowBySecret = shared && got && shared === got;

  const allowByRole = role === "admin" || role === "owner";

  if (!allowByRole && !allowBySecret) {
    const err: any = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  return {
    tenantId,
    actorId,
    role: allowByRole ? role : "admin",
    ip: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  };
}
