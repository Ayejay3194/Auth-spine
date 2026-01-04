import type { VerticalConfig } from "@/verticals/types";

export interface ComplianceEvalInput {
  config: VerticalConfig;
  event: {
    type: string;
    subject?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    region?: { country?: string; state?: string };
  };
  consents: string[];
  professional?: Record<string, any>;
}

export interface ComplianceEvalResult {
  ok: boolean;
  blocked: boolean;
  requiredConsentsMissing: string[];
  missingFields: string[];
  termMatches: string[];
  triggeredRules: string[];
}

export function evaluateCompliance(input: ComplianceEvalInput): ComplianceEvalResult {
  const { config, event, consents, professional } = input;

  const requiredConsentsMissing: string[] =
    (config.compliance.consentsRequired ?? []).filter((c) => !consents.includes(c));

  const missingFields: string[] = [];
  const termMatches: string[] = [];
  const triggeredRules: string[] = [];

  const rules = config.compliance.rules ?? [];
  for (const r of rules) {
    if (r.when !== event.type) continue;

    // region scope
    if (r.regionScope) {
      const stateOk = !r.regionScope.state || r.regionScope.state === event.region?.state;
      const countryOk = !r.regionScope.country || r.regionScope.country === event.region?.country;
      if (!stateOk || !countryOk) continue;
    }

    triggeredRules.push(r.id);

    if (r.blockIfMissingConsent && !consents.includes(r.blockIfMissingConsent)) {
      requiredConsentsMissing.push(r.blockIfMissingConsent);
    }

    if (r.requireFields?.length) {
      for (const fp of r.requireFields) {
        const val = getDot(professional ?? {}, fp);
        if (val == null || val === "") missingFields.push(fp);
      }
    }

    if (r.blockIfTermsMatch?.length) {
      const hay = JSON.stringify(event.payload ?? {}).toLowerCase();
      for (const t of r.blockIfTermsMatch) {
        if (hay.includes(String(t).toLowerCase())) termMatches.push(String(t));
      }
    }
  }

  const uniq = (arr: string[]) => [...new Set(arr)];
  const missC = uniq(requiredConsentsMissing);
  const missF = uniq(missingFields);
  const terms = uniq(termMatches);
  const trig = uniq(triggeredRules);

  const blocked = missC.length > 0 || missF.length > 0 || terms.length > 0;
  return { ok: !blocked, blocked, requiredConsentsMissing: missC, missingFields: missF, termMatches: terms, triggeredRules: trig };
}

function getDot(obj: any, path: string) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}
