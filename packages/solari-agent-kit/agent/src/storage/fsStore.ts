import fs from "fs";
import path from "path";

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readJson<T>(file: string, fallback: T): T {
  try {
    const s = fs.readFileSync(file, "utf-8");
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(file: string, obj: any) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

export function appendJsonl(file: string, obj: any) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, JSON.stringify(obj) + "\n");
}
