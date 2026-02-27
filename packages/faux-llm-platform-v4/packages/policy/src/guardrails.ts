export interface GuardrailReport {
  ok: boolean;
  issues: string[];
}

export function enforceContextLimit(input: string, maxChars: number): GuardrailReport {
  const ok = input.length <= maxChars;
  return { ok, issues: ok ? [] : ["context_too_large"] };
}

export function enforceNoSecrets(_text: string): GuardrailReport {
  // placeholder: add redaction rules as needed
  return { ok: true, issues: [] };
}
