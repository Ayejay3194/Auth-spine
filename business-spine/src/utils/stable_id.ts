import { createHash } from "crypto";

/**
 * Generate a stable, deterministic ID from a string input.
 * Useful for idempotent operations and audit trails.
 */
export function stableId(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}


