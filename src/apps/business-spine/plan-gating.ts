type Plan = "FREE"|"PRO"|"BUSINESS"|"ENTERPRISE";

const PLAN_FEATURES: Record<Plan, string[]> = {
  FREE: ["core.booking"],
  PRO: ["core.booking","custom.branding","api.basic"],
  BUSINESS: ["core.booking","custom.branding","api.basic","webhooks","exports"],
  ENTERPRISE: ["core.booking","custom.branding","api.basic","webhooks","exports","sso","scim","byok","residency"],
};

export function requireFeature(plan: Plan, feature: string) {
  if (!PLAN_FEATURES[plan]?.includes(feature)) throw new Error("FEATURE_NOT_IN_PLAN");
}
