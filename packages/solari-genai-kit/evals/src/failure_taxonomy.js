export function classifyFailure(body, httpStatus) {
  const err = (body && (body.error || body.message)) ? String(body.error || body.message) : "";
  const errors = body?.errors;

  // Runtime-level
  if (httpStatus >= 500) return { code: "RUNTIME_500", detail: err || "server_error" };
  if (httpStatus === 401) return { code: "AUTH", detail: "unauthorized" };
  if (httpStatus === 404) return { code: "ROUTE", detail: "not_found" };

  // LLM-level
  if (/LLM\s\d+/.test(err) || /LLM error/i.test(err)) return { code: "LLM_UPSTREAM", detail: err };

  // Parse/schema
  if (/parse JSON/i.test(err) || /Could not parse JSON/i.test(err)) return { code: "JSON_PARSE", detail: err };
  if (/schema/i.test(err) || (Array.isArray(errors) && errors.length)) return { code: "SCHEMA", detail: (errors || err) };

  // Tooling
  if (/tool/i.test(err)) return { code: "TOOL", detail: err };

  return { code: "UNKNOWN", detail: err || "unknown" };
}

export function scoreConfidenceFromResponse(body) {
  // runtime now includes confidence when ok
  if (body?.ok && body?.confidence) return body.confidence;
  return null;
}
