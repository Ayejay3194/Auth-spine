import fs from "node:fs";
import path from "node:path";

export function renderTemplate(templateKey: string, vars: Record<string, unknown>) {
  const p = path.join(process.cwd(), "src/marketing/templates", templateKey + ".md");
  const raw = fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "Template missing: {{templateKey}}";
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
}
