export type Env = Record<string, string | undefined>;

export interface AppConfig {
  nodeEnv: "development" | "test" | "production";
  tenantIdDefault: string;
  databaseUrl?: string;
  redisUrl?: string;

  llmBaseUrl: string;
  llmApiKey: string;
  llmModel: string;

  logLevel: "debug" | "info" | "warn" | "error";
}

function req(env: Env, k: string): string {
  const v = env[k];
  if (!v) throw new Error(`CONFIG_MISSING:${k}`);
  return v;
}

function opt(env: Env, k: string): string | undefined {
  return env[k] || undefined;
}

export function loadConfig(env: Env = process.env): AppConfig {
  const nodeEnv = (env["NODE_ENV"] as any) ?? "development";
  if (!["development","test","production"].includes(nodeEnv)) throw new Error("CONFIG_BAD:NODE_ENV");

  const cfg: AppConfig = {
    nodeEnv,
    tenantIdDefault: env["TENANT_ID_DEFAULT"] ?? "public",
    databaseUrl: opt(env, "DATABASE_URL"),
    redisUrl: opt(env, "REDIS_URL"),
    llmBaseUrl: env["LLM_BASE_URL"] ?? "http://localhost:8000/v1",
    llmApiKey: env["LLM_API_KEY"] ?? "local",
    llmModel: env["LLM_MODEL"] ?? "local-model",
    logLevel: (env["LOG_LEVEL"] as any) ?? "info",
  };

  // Hard fail only for truly required pieces.
  // LLM creds are required for chat.
  req(env, "LLM_BASE_URL"); // may be defaulted, but enforce explicitness in prod
  req(env, "LLM_MODEL");

  return cfg;
}
