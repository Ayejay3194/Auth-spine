/**
 * Legal & Compliance Disaster Kit
 * 
 * This pack turns your "legal/compliance disasters" list into:
 * - Trackable checklists
 * - Starter templates (privacy, ToS, DPA, cookie, retention, AUP, accessibility)
 * - Incident response + breach comms templates
 * - Product requirements (export/delete/consent/log redaction)
 * - Registries (vendors, subprocessors, OSS licenses, ROPA, DPIA)
 * - Billing controls
 */

export * from './compliance-manager.js';
export * from './checklist-tracker.js';
export * from './policy-templates.js';
export * from './incident-response.js';
export * from './product-requirements.js';
export * from './registries/index.js';
export * from './billing-controls.js';

// Main exports
export { LegalCompliance } from './legal-compliance.js';
export { 
  ComplianceItem, 
  ComplianceChecklist, 
  CompliancePolicy,
  IncidentReport,
  ComplianceRegistry
} from './types.js';

// Default configuration
export const DEFAULT_COMPLIANCE_CONFIG = {
  enabledFrameworks: [
    'GDPR',
    'CCPA',
    'HIPAA',
    'SOX',
    'SOC2',
    'ISO27001'
  ],
  autoTrackChanges: true,
  requireApproval: true,
  auditRetention: 2555, // 7 years in days
  incidentRetention: 1825, // 5 years in days
  enableNotifications: true,
  enableAutomatedChecks: true
};
