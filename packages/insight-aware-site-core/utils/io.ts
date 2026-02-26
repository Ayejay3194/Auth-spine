import fs from "node:fs";
import path from "node:path";

export function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

export function writeText(filePath: string, text: string) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text, "utf-8");
}

export function writeJson(filePath: string, obj: unknown) {
  writeText(filePath, JSON.stringify(obj, null, 2));
}
