import type { Role } from "@prisma/client";
import { verifySession } from "@/src/auth/session";

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Extract and validate user session from request
 * Validates JWT token from httpOnly cookie against database
 * Prevents authentication bypass via header injection
 */
export async function getActor(req: Request): Promise<{ userId: string; role: Role }> {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    throw new AuthenticationError("Missing session cookie");
  }

  const sessionToken = extractSessionToken(cookieHeader);
  if (!sessionToken) {
    throw new AuthenticationError("Invalid session token");
  }

  const claims = await verifySession(sessionToken);
  if (!claims) {
    throw new AuthenticationError("Session not found or expired");
  }

  return {
    userId: claims.sub,
    role: claims.role as Role
  };
}

/**
 * Extract session token from cookie header
 */
function extractSessionToken(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(";").map(c => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith("session=")) {
      return decodeURIComponent(cookie.slice("session=".length));
    }
  }
  return null;
}
