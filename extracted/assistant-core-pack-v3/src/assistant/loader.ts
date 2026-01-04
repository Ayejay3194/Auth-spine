// src/assistant/loader.ts
import fs from "node:fs";
import path from "node:path";
export type JsonlRecord = Record<string, any>;

export function loadJsonl(filePath: string): JsonlRecord[] {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, "utf-8");
  return raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l));
}
