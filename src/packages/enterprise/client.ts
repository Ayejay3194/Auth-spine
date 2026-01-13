import type { Database } from "./types";

/**
 * Strongly typed Supabase client factory.
 * Replace the URL/ANON_KEY with your environment variables.
 */
export function createSupabaseClient() {
  const url = (globalThis as any).process?.env?.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = (globalThis as any).process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Mock client for development - in production this would be real Supabase client
  return {
    from: (table: string) => ({
      insert: (data: any) => ({ error: null }),
      select: () => ({ data: [], error: null }),
      update: (data: any) => ({ error: null }),
      delete: () => ({ error: null })
    }),
    rpc: (fn: string, params: any) => Promise.resolve({ data: [], error: null })
  };
}

/**
 * Service role client for privileged operations.
 * Keep this server-side only.
 */
export function createSupabaseServiceClient() {
  const url = (globalThis as any).process?.env?.SUPABASE_URL || "";
  const serviceKey = (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service environment variables");
  }

  // Mock client for development - in production this would be real Supabase client
  return {
    from: (table: string) => ({
      insert: (data: any) => ({ error: null }),
      select: () => ({ data: [], error: null }),
      update: (data: any) => ({ error: null }),
      delete: () => ({ error: null })
    }),
    rpc: (fn: string, params: any) => Promise.resolve({ data: [], error: null })
  };
}
