import * as fs from "node:fs";
import * as readline from "node:readline";

export async function* readJsonl(path: string): AsyncGenerator<any> {
  const rl = readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity });
  for await (const line of rl) {
    const t = line.trim();
    if (!t) continue;
    yield JSON.parse(t);
  }
}

export async function writeJsonl(path: string, rows: any[]): Promise<void> {
  const out = rows.map(r => JSON.stringify(r)).join("\n") + "\n";
  await fs.promises.writeFile(path, out, "utf-8");
}
