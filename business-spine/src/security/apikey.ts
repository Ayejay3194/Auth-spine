import { prisma } from "@/lib/prisma";
import { sha256 } from "./crypto";

export function generateApiKey() {
  const raw = "sk_" + Buffer.from(cryptoRandom(24)).toString("base64url");
  const prefix = raw.slice(0, 8);
  return { raw, prefix, hash: sha256(raw) };
}

function cryptoRandom(n: number) {
  const b = Buffer.alloc(n);
  for (let i = 0; i < n; i++) b[i] = Math.floor(Math.random() * 256);
  return b;
}

export async function verifyApiKey(raw: string) {
  const prefix = raw.slice(0, 8);
  const rec = await prisma.apiKey.findFirst({ where: { prefix, revokedAt: null } });
  if (!rec) return null;
  if (rec.keyHash !== sha256(raw)) return null;
  await prisma.apiKey.update({ where: { id: rec.id }, data: { lastUsedAt: new Date() } });
  return rec.userId;
}
