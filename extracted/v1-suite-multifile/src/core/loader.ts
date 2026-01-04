import fs from "node:fs";
import path from "node:path";

export type JsonlRecord = Record<string, any>;

export function loadJson(filePath: string): any {
  const abs = path.resolve(filePath);
  return JSON.parse(fs.readFileSync(abs, "utf-8"));
}

export function loadText(filePath: string): string {
  const abs = path.resolve(filePath);
  return fs.readFileSync(abs, "utf-8");
}

export function loadJsonl(filePath: string): JsonlRecord[] {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, "utf-8");
  return raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => JSON.parse(l));
}

export function exists(filePath: string): boolean {
  return fs.existsSync(path.resolve(filePath));
}
