/**
 * Supabase At Home Pack
 * 
 * Local development environment with Docker, Kong gateway,
 * and development tools for Supabase applications.
 */

export * from './local-development.js';
export * from './docker-setup.js';
export * from './kong-gateway.js';
export * from './development-scripts.js';

// Main exports
export { SupabaseAtHome } from './supabase-at-home.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_AT_HOME_CONFIG = {
  docker: {
    enabled: true,
    compose: 'docker-compose.yml',
    services: ['postgres', 'kong', 'supabase', 'studio'],
    ports: {
      postgres: 5432,
      kong: 8000,
      supabase: 8000,
      studio: 3000
    }
  },
  kong: {
    enabled: true,
    adminPort: 8001,
    proxyPort: 8000,
    plugins: ['cors', 'rate-limiting', 'key-auth', 'jwt'],
    routes: []
  },
  development: {
    hotReload: true,
    watchFiles: ['**/*.ts', '**/*.js', '**/*.sql'],
    autoMigrate: true,
    seedData: true
  },
  monitoring: {
    enabled: true,
    metrics: true,
    logs: true,
    healthChecks: true
  }
};
