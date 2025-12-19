import crypto from "node:crypto";

function key() {
  const k = process.env.APP_SECRET ?? process.env.JWT_SECRET ?? "";
  if (!k) throw new Error("APP_SECRET missing");
  // derive 32 bytes
  return crypto.createHash("sha256").update(k).digest();
}

export function encrypt(plain: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decrypt(b64: string) {
  const buf = Buffer.from(b64, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(enc), decipher.final()]);
  return plain.toString("utf8");
}

export function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}
