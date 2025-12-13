import crypto from "node:crypto";

export function uid(prefix = "id"): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

export function stableHash(obj: unknown): string {
  const json = JSON.stringify(obj, Object.keys(obj as any).sort());
  return crypto.createHash("sha256").update(json).digest("hex");
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function normalizeText(s: string): string {
  return s.trim().toLowerCase();
}

export function stripPunct(s: string): string {
  return s.replace(/[.,!?;:()\[\]{}"]/g, " ").replace(/\s+/g, " ").trim();
}
