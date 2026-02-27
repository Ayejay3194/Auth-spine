/**
 * Minimal schema validation (no deps) for the schemas in this repo.
 * You can swap this later for Ajv if you want, but this keeps the platform zero-dep.
 */

export type ValidationIssue = { path: string; message: string };
export type ValidationResult = { ok: true } | { ok: false; issues: ValidationIssue[] };

function isObj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

export function validateAssistantResponse(x: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isObj(x)) return { ok: false, issues: [{ path: "", message: "not_an_object" }] };

  const type = x["type"];
  const payload = x["payload"];

  if (type !== "answer" && type !== "tool_call" && type !== "error") {
    issues.push({ path: ".type", message: "invalid_enum" });
  }
  if (!isObj(payload)) issues.push({ path: ".payload", message: "payload_not_object" });

  // no additionalProperties at top-level for this minimal validator
  for (const k of Object.keys(x)) {
    if (k !== "type" && k !== "payload" && k !== "meta") {
      issues.push({ path: "." + k, message: "unexpected_property" });
    }
  }

  return issues.length ? { ok: false, issues } : { ok: true };
}

export function validateToolCall(x: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isObj(x)) return { ok: false, issues: [{ path: "", message: "not_an_object" }] };
  if (typeof x["tool"] !== "string") issues.push({ path: ".tool", message: "tool_not_string" });
  if (!isObj(x["args"])) issues.push({ path: ".args", message: "args_not_object" });

  for (const k of Object.keys(x)) {
    if (k !== "tool" && k !== "args") issues.push({ path: "." + k, message: "unexpected_property" });
  }

  return issues.length ? { ok: false, issues } : { ok: true };
}
