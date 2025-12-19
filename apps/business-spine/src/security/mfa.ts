import { authenticator } from "otplib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, sha256 } from "./crypto";

export async function startMfa(userId: string, issuer = "BusinessSpine") {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userId, issuer, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  await prisma.mfaSecret.upsert({
    where: { userId },
    create: { userId, secretEnc: encrypt(secret) },
    update: { secretEnc: encrypt(secret), enabledAt: null }
  });

  // recovery codes (10)
  await prisma.mfaRecoveryCode.deleteMany({ where: { userId } });
  const codes = Array.from({ length: 10 }, () => Math.random().toString(36).slice(2, 10).toUpperCase());
  await prisma.mfaRecoveryCode.createMany({
    data: codes.map(c => ({ userId, codeHash: sha256(c) }))
  });

  return { qrDataUrl, recoveryCodes: codes };
}

export async function confirmMfa(userId: string, token: string) {
  const rec = await prisma.mfaSecret.findUnique({ where: { userId } });
  if (!rec) return false;
  const secret = decrypt(rec.secretEnc);
  const ok = authenticator.check(token, secret);
  if (ok) await prisma.mfaSecret.update({ where: { userId }, data: { enabledAt: new Date() } });
  return ok;
}

export async function verifyMfaToken(userId: string, token: string) {
  const rec = await prisma.mfaSecret.findUnique({ where: { userId } });
  if (!rec?.enabledAt) return true; // MFA not enabled
  const secret = decrypt(rec.secretEnc);
  return authenticator.check(token, secret);
}

export async function useRecoveryCode(userId: string, code: string) {
  const hash = sha256(code);
  const rec = await prisma.mfaRecoveryCode.findFirst({ where: { userId, codeHash: hash, usedAt: null } });
  if (!rec) return false;
  await prisma.mfaRecoveryCode.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
  return true;
}
