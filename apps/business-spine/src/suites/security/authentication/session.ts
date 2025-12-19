import { prisma } from "@/lib/prisma";
import { sha256 } from "@/src/security/crypto";
import { signToken, verifyToken } from "./jwt";
import type { JwtClaims } from "./jwt";

export function newSessionToken(claims: JwtClaims) {
  // JWT is the session token, stored in httpOnly cookie
  const token = signToken(claims, 60 * 60 * 24 * 14); // 14 days
  const tokenHash = sha256(token);
  return { token, tokenHash };
}

export async function persistSession(userId: string, tokenHash: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  await prisma.session.create({ data: { userId, tokenHash, expiresAt } });
}

export async function revokeSession(token: string) {
  const tokenHash = sha256(token);
  await prisma.session.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function verifySession(token: string): Promise<JwtClaims | null> {
  try {
    const claims = verifyToken(token);
    const tokenHash = sha256(token);
    const sess = await prisma.session.findFirst({ where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } } });
    if (!sess) return null;
    return claims;
  } catch {
    return null;
  }
}
