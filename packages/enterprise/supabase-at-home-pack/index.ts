/**
 * Supabase At Home Pack
 * 
 * Complete Supabase development environment setup with Docker,
 * local development tools, and home deployment capabilities.
 */

export * from './local-development.js';
export * from './docker-setup.js';
export * from './database-migrations.js';
export * from './api-gateway.js';
export * from './development-tools.js';

// Main exports
export { SupabaseAtHomePack } from './supabase-at-home-pack.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SUPABASE_AT_HOME_CONFIG = {
  local: {
    enabled: true,
    docker: true,
    hotReload: true,
    debugging: true,
    testing: true
  },
  database: {
    enabled: true,
    migrations: true,
    seeds: true,
    backups: true,
    monitoring: true
  },
  api: {
    enabled: true,
    gateway: true,
    routing: true,
    middleware: true,
    documentation: true
  },
  tools: {
    enabled: true,
    cli: true,
    dashboard: true,
    logs: true,
    metrics: true
  }
};
