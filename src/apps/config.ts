import { z } from 'zod';

// Environment configuration schema
const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // Redis (optional but recommended)
  REDIS_URL: z.string().url().optional(),
  
  // CORS
  CORS_ORIGINS: z.string().transform(val => val.split(',')).default(['http://localhost:3000']),
  
  // API Configuration
  API_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  API_RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('pretty'),
  
  // External Services (optional)
  SENTRY_DSN: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Feature Flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  ENABLE_CACHE: z.string().transform(val => val === 'true').default('true'),
  ENABLE_RATE_LIMITING: z.string().transform(val => val === 'true').default('true'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_MAX_AGE: z.string().transform(Number).default('86400000'), // 24 hours
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  ALLOWED_FILE_TYPES: z.string().transform(val => val.split(',')).default(['image/jpeg', 'image/png', 'application/pdf']),
});

// Validate and export configuration
export const config = envSchema.parse(process.env);

// Type-safe configuration export
export type Config = z.infer<typeof envSchema>;

// Runtime validation helper
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
    } else {
      errors.push('Unknown validation error');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Development helper to check config
export function checkConfig() {
  if (process.env.NODE_ENV === 'development') {
    const validation = validateConfig();
    if (!validation.valid) {
      console.error('❌ Configuration validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
    console.log('✅ Configuration is valid');
  }
}

// Export individual config values with proper typing
export const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REDIS_URL,
  CORS_ORIGINS,
  API_RATE_LIMIT_WINDOW_MS,
  API_RATE_LIMIT_MAX,
  LOG_LEVEL,
  LOG_FORMAT,
  SENTRY_DSN,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  ENABLE_ANALYTICS,
  ENABLE_CACHE,
  ENABLE_RATE_LIMITING,
  BCRYPT_ROUNDS,
  SESSION_MAX_AGE,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} = config;
