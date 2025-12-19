/**
 * Environment variable validation helpers.
 */
export function getRequiredEnv(key: string): string {
  const value = (globalThis as any).process?.env?.[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnv(key: string, defaultValue: string = ""): string {
  return (globalThis as any).process?.env?.[key] ?? defaultValue;
}

/**
 * Supabase environment variables with validation.
 */
export const supabaseEnv = {
  url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  serviceUrl: getOptionalEnv("SUPABASE_URL"),
  serviceKey: getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
} as const;
