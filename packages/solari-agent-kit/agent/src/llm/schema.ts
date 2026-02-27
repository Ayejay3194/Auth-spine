import Ajv from "ajv";
import planSchema from "../schemas/plan.schema.json" assert { type: "json" };
import reportSchema from "../schemas/report.schema.json" assert { type: "json" };

export type SchemaName = "plan" | "report";
const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addSchema(planSchema, "plan");
ajv.addSchema(reportSchema, "report");

export function validateSchema(name: SchemaName, data: unknown): { ok: boolean; errors?: string[] } {
  const v = ajv.getSchema(name);
  if (!v) throw new Error(`Schema not found: ${name}`);
  const ok = v(data) as boolean;
  if (ok) return { ok: true };
  const errors = (v.errors ?? []).map(e => `${e.instancePath} ${e.message}`.trim());
  return { ok: false, errors };
}
