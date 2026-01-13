import { z } from "zod";

const EnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(input: Record<string, string | undefined> = process.env): Env {
  const parsed = EnvSchema.safeParse({
    SUPABASE_URL: input.SUPABASE_URL,
    SUPABASE_ANON_KEY: input.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: input.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid env: ${msg}`);
  }
  return parsed.data;
}
