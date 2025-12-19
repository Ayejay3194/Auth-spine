export type OpsActor = {
  actor_id: string;
  role: "admin" | "ops" | "system";
  ip_hash?: string;
  user_agent?: string;
};

export type OpsActionKey =
  | "auth.rateLimit.strict"
  | "auth.captcha.enabled"
  | "auth.oauth.disableProvider"
  | "auth.forceLogoutAll"
  | "auth.blockNewSignups"
  | "auth.tokenRefresh.enabled";

export type OpsActionRequest = {
  actor: OpsActor;
  reason: string;
  step_up_token?: string; // required for high-risk actions
  actions: Array<
    | { key: "auth.oauth.disableProvider"; value: { provider: string; enabled: boolean } }
    | { key: Exclude<OpsActionKey, "auth.oauth.disableProvider">; value: boolean }
  >;
};

export type OpsActionResult = {
  ok: boolean;
  applied: Array<{ key: string; before: unknown; after: unknown }>;
  blocked: Array<{ key: string; reason: string }>;
  audit_id: string;
};


