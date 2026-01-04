import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ISSUER: z.string().url('ISSUER must be a valid URL'),
  JWT_ALG: z.enum(['HS256', 'RS256']).default('HS256'),
  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .optional(),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_KEY_ID: z.string().default('auth-spine-key'),
  ACCESS_TTL_SECONDS: z.coerce.number().default(1800), // 30 minutes
  REFRESH_TTL_SECONDS: z.coerce.number().default(604800), // 7 days
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(5),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(30000),
  PAYLOAD_SIZE_LIMIT: z.string().default('10kb')
})

export type Environment = z.infer<typeof envSchema>

function validateEnv(): Environment {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(e => e.code === 'invalid_type')
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join('\n')
      
      console.error('Environment validation failed:')
      console.error(missingVars)
      process.exit(1)
    }
    throw error
  }
}

// Validate JWT configuration
function validateJwtConfig(env: Environment): void {
  if (env.JWT_ALG === 'HS256' && !env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is required when JWT_ALG is HS256')
    process.exit(1)
  }

  if (env.JWT_ALG === 'RS256' && (!env.JWT_PRIVATE_KEY || !env.JWT_PUBLIC_KEY)) {
    console.error('ERROR: JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are required when JWT_ALG is RS256')
    process.exit(1)
  }

  // Warn about weak secrets in development
  if (env.NODE_ENV === 'development' && env.JWT_SECRET && env.JWT_SECRET.length < 64) {
    console.warn('WARNING: JWT_SECRET is less than 64 characters. Consider using a stronger secret.')
  }
}

export const env = validateEnv()
validateJwtConfig(env)
