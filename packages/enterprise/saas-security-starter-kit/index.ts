/**
 * SaaS Security Starter Kit
 * 
 * Essential security foundation for SaaS applications with
 * authentication, authorization, data protection, and compliance.
 */

export * from './auth-foundation.js';
export * from './data-protection.js';
export * from './security-controls.js';
export * from './compliance-basics.js';

// Main exports
export { SaasSecurityStarterKit } from './saas-security-starter-kit.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SAAS_SECURITY_CONFIG = {
  authentication: {
    enabled: true,
    basicAuth: true,
    sessionManagement: true,
    passwordPolicy: true,
    basicRBAC: true
  },
  dataProtection: {
    enabled: true,
    encryption: true,
    accessControl: true,
    auditLogging: true,
    dataRetention: true
  },
  security: {
    enabled: true,
    inputValidation: true,
    outputEncoding: true,
    csrfProtection: true,
    rateLimiting: true,
    securityHeaders: true
  },
  compliance: {
    enabled: true,
    basicControls: true,
    auditReadiness: true,
    documentation: true,
    reporting: true
  }
};
