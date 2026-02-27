/**
 * MLOps-ish Artifact Registry (local FS)
 * - store model config + metrics
 * - keep hashes for reproducibility
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export interface Artifact {
  id: string;
  createdAt: string;
  name: string;
  config: any;
  metrics: any;
}

export function writeArtifact(dir: string, name: string, config: any, metrics: any): Artifact {
  mkdirSync(dir, { recursive: true });
  const payload = { name, config, metrics };
  const id = sha256(JSON.stringify(payload)).slice(0, 16);
  const art: Artifact = { id, createdAt: new Date().toISOString(), name, config, metrics };
  writeFileSync(join(dir, `${name}.${id}.json`), JSON.stringify(art, null, 2), "utf-8");
  return art;
}
