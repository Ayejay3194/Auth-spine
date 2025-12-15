import crypto from "node:crypto";
export function uid(prefix = "id") {
    return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}
export function stableHash(obj) {
    const json = JSON.stringify(obj, Object.keys(obj).sort());
    return crypto.createHash("sha256").update(json).digest("hex");
}
export function clamp01(n) {
    return Math.max(0, Math.min(1, n));
}
export function normalizeText(s) {
    return s.trim().toLowerCase();
}
export function stripPunct(s) {
    return s.replace(/[.,!?;:()\[\]{}"]/g, " ").replace(/\s+/g, " ").trim();
}
