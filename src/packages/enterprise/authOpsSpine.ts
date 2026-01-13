import { OpsAuthEvent, OpsSpineResponse } from "../types/opsAuth";

/**
 * Auth Ops Spine (non-LLM fallback).
 * Swap implementation later (JSONL retrieval, LLM, etc.) while keeping this output contract.
 */
export function runAuthOpsSpine(event: OpsAuthEvent): OpsSpineResponse {
  const sev = clampSev(event.severity_guess);

  switch (event.incident_type) {
    case "FAILED_LOGINS_SPIKE":
      return makeResponse(sev, "AUTH_OPS", {
        decision: "Contain likely brute force and protect legitimate users.",
        steps: [
          "Enable stricter rate limiting and IP throttling at the edge.",
          "Require step-up (CAPTCHA / email OTP) after N failures.",
          "Monitor for credential stuffing (many accounts, same IP/range).",
          "Review successful logins that follow failure spikes.",
          "After stability, tune thresholds to reduce false positives."
        ],
        risks: [
          "Over-blocking can lock out legitimate users.",
          "Attackers can rotate IPs; account-based throttles still required."
        ],
        rollback: [
          "Remove IP blocks if false positives spike.",
          "Keep account-based throttles enabled while investigating."
        ],
        flags: [
          { key: "auth.rateLimit.strict", value: true, reason: "Reduce brute-force blast radius." },
          { key: "auth.captcha.enabled", value: true, reason: "Slow credential stuffing." }
        ]
      });

    case "PASSWORD_RESET_FAILURES":
      return makeResponse(sev, "AUTH_OPS", {
        decision: "Restore reset reliability; do not risk account lockouts.",
        steps: [
          "Verify email provider delivery and reset link routing (no 404s).",
          "Check token signing secret, TTL, and clock skew across services.",
          "Ensure tokens are single-use and invalidate on success.",
          "Add retries + dead-letter queue for email sends.",
          "Run an end-to-end reset test in staging, then prod."
        ],
        risks: [
          "Token validation bugs create user lockout and support spikes.",
          "Retrying without idempotency can send multiple emails."
        ],
        rollback: [
          "Route resets to a known-good legacy handler if available.",
          "Temporarily disable non-critical emails to protect deliverability."
        ],
        flags: [
          { key: "email.nonCritical.enabled", value: false, reason: "Protect deliverability and reduce noise." }
        ]
      });

    case "OAUTH_CALLBACK_ERRORS":
      return makeResponse(sev, "AUTH_OPS", {
        decision: "Stabilize OAuth by reverting to a known-good config and verifying providers.",
        steps: [
          "Freeze auth-related deploys and compare error rate by provider.",
          "Verify redirect URIs, client ids/secrets, and callback routes in production.",
          "Confirm state/PKCE validation behavior and cookie settings (SameSite/Secure).",
          "If a recent change caused this, revert the auth config or deployment.",
          "Add a canary login test (headless) to CI for each provider."
        ],
        risks: [
          "OAuth failures block signups and logins immediately.",
          "Cookie/SameSite misconfigs can appear only in certain browsers."
        ],
        rollback: [
          "Disable the affected provider temporarily.",
          "Revert to last known-good auth config and redeploy."
        ],
        flags: [
          { key: "auth.oauth.enabled", value: true, reason: "Ensure provider gates are explicit." }
        ]
      });

    case "JWT_VALIDATION_ERRORS":
      return makeResponse(sev, "SECURITY", {
        decision: "Prevent invalid sessions from granting access; restore consistent signing/verification.",
        steps: [
          "Identify whether failures are signing secret mismatch or key rotation drift.",
          "Confirm all services use the same issuer/audience/alg constraints.",
          "If keys rotated, ensure old keys remain valid during overlap window.",
          "Invalidate sessions only if you can re-authenticate users safely.",
          "Add regression tests for token expiry and refresh paths."
        ],
        risks: [
          "Bad validation can lock everyone out or let bad tokens through.",
          "Immediate forced logout can create churn and support load."
        ],
        rollback: [
          "Revert to prior signing key set and config.",
          "Disable refresh path changes behind a feature flag."
        ],
        flags: [
          { key: "auth.tokenRefresh.enabled", value: false, reason: "Stop bad refresh logic from propagating." }
        ]
      });

    case "TENANT_LEAK_RISK":
      return makeResponse(0, "TENANCY", {
        decision: "Immediate containment and isolation proof.",
        steps: [
          "Disable the affected endpoint/surface and block cross-tenant queries.",
          "Clear shared caches and ensure all cache keys are tenant-scoped.",
          "Audit ORM/query layer for mandatory tenant_id filters.",
          "Add automated tests: Tenant A cannot access Tenant B resources.",
          "Only re-enable after isolation tests pass in staging and canary."
        ],
        risks: [
          "One confirmed leak is catastrophic.",
          "Caching and search indexes are common foot-guns."
        ],
        rollback: [
          "Keep tenancy-related features OFF until verified.",
          "Revert to last known-good build and config."
        ],
        flags: [
          { key: "tenancy.enabled", value: false, reason: "Contain potential cross-tenant exposure." }
        ]
      });

    default:
      return makeResponse(sev, "AUTH_OPS", {
        decision: "Triage, contain, verify, then fix with tests.",
        steps: [
          "Identify scope and affected endpoints.",
          "Apply the smallest reversible mitigation (flag/config) first.",
          "Verify recovery with metrics and a smoke test.",
          "Implement durable fix with regression tests.",
          "Stage rollout with canary before full enable."
        ],
        risks: [
          "Changing too much at once makes root cause unclear.",
          "Debugging live increases user impact."
        ],
        rollback: [
          "Revert deployment/config and keep new flags OFF.",
          "Restore last-known-good state and retest critical flows."
        ]
      });
  }
}

function clampSev(sev: number): 0 | 1 | 2 | 3 {
  if (sev <= 0) return 0;
  if (sev === 1) return 1;
  if (sev === 2) return 2;
  return 3;
}

function makeResponse(
  sev: 0 | 1 | 2 | 3,
  category: "AUTH_OPS" | "SECURITY" | "TENANCY" | "BILLING" | "QUALITY",
  input: {
    decision: string;
    steps: string[];
    risks: string[];
    rollback: string[];
    flags?: Array<{ key: string; value: boolean; reason: string }>;
  }
): OpsSpineResponse {
  return {
    decision: input.decision,
    steps: input.steps,
    risk_notes: input.risks,
    rollback_plan: input.rollback,
    recommended_flags: input.flags ?? [],
    classification: { sev, category }
  };
}
