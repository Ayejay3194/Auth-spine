/**
 * Tiny helpers so your models and features don't silently mismatch.
 */

export function stableHash(str: string): string {
  // FNV-1a 32-bit (simple, deterministic, good enough for schema IDs)
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
