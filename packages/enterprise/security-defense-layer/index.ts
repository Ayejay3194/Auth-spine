/**
 * Security Defense Layer
 * 
 * Comprehensive security defense framework providing multi-layered
 * protection with authentication, network security, compliance,
 * incident response, and security operations.
 */

export * from './authentication-defense.js';
export * from './network-defense.js';
export * from './compliance-defense.js';
export * from './incident-response.js';
export * from './security-operations.js';

// Main exports
export { SecurityDefenseLayer } from './security-defense-layer.js';

// Type exports
export * from './types.js';

// Default configuration
export const DEFAULT_SECURITY_DEFENSE_CONFIG = {
  authentication: {
    enabled: true,
    multiFactor: true,
    biometric: true,
    adaptiveAuth: true,
    zeroTrust: true
  },
  network: {
    enabled: true,
    firewall: true,
    ddosProtection: true,
    intrusionDetection: true,
    networkSegmentation: true,
    vpnAccess: true
  },
  compliance: {
    enabled: true,
    automatedCompliance: true,
    continuousMonitoring: true,
    auditReadiness: true,
    evidenceManagement: true
  },
  incident: {
    enabled: true,
    automatedDetection: true,
    responseAutomation: true,
    forensics: true,
    threatIntelligence: true
  },
  operations: {
    enabled: true,
    securityMonitoring: true,
    vulnerabilityManagement: true,
    patchManagement: true,
    securityAnalytics: true
  }
};
