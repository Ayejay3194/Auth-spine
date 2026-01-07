import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { api } from "@/src/core/api";
import { newSessionToken, persistSession } from "@/src/auth/session";
import { setSessionCookie } from "@/src/security/cookies";
import { verifyMfaToken, useRecoveryCode } from "@/src/security/mfa";
import { isRateLimited, recordFailedAttempt, recordSuccessfulAttempt, getRateLimitRemainingSeconds } from "@/src/security/rate-limit";
import { verifyPassword } from "@/src/security/password-migration";

const Q = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
  mfaToken: z.string().optional(),
  recoveryCode: z.string().optional()
});

export async function POST(req: Request) {
  return api(async () => {
    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    // Check rate limit
    if (isRateLimited(ip)) {
      const remaining = getRateLimitRemainingSeconds(ip);
      throw new Error(`rate_limited:${remaining}`);
    }

    const body = Q.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user?.passwordHash) {
      recordFailedAttempt(ip);
      throw new Error("unauthorized");
    }

    const ok = await verifyPassword(user.passwordHash, body.password);
    if (!ok) {
      recordFailedAttempt(ip);
      throw new Error("unauthorized");
    }

    // MFA if enabled
    if (body.recoveryCode) {
      const rok = await useRecoveryCode(user.id, body.recoveryCode);
      if (!rok) throw new Error("unauthorized");
    } else {
      const tok = body.mfaToken ?? "";
      const mok = await verifyMfaToken(user.id, tok);
      if (!mok) throw new Error("unauthorized");
    }

    const { token, tokenHash } = newSessionToken({ sub: user.id, role: user.role as any });
    await persistSession(user.id, tokenHash);

    // Record successful login (clears rate limit)
    recordSuccessfulAttempt(ip);

    return new Response(JSON.stringify({ ok: true, userId: user.id, role: user.role }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setSessionCookie(token),
      }
    });
  });
}
