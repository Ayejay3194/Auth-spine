export type FailureCode =
  | "PLAN_JSON_PARSE" | "PLAN_SCHEMA"
  | "REPORT_JSON_PARSE" | "REPORT_SCHEMA"
  | "NO_REPORT_STEP"
  | "UNKNOWN";

export function classifyFailure(res: any): FailureCode {
  const e = String(res?.error || "");
  if (!e) return "UNKNOWN";
  if (e.startsWith("PLAN_")) return e as any;
  if (e.startsWith("REPORT_")) return e as any;
  if (e === "NO_REPORT_STEP") return "NO_REPORT_STEP";
  return "UNKNOWN";
}
