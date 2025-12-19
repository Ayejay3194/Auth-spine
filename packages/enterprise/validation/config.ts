/**
 * Validation Configuration - Default configurations for validation system
 */

import { ValidationSettings, ComplianceSettings, AuditSettings } from './types';

export const DEFAULT_VALIDATION_SETTINGS: ValidationSettings = {
  enableStrictValidation: true,
  autoCorrectMinorErrors: true,
  requireApprovalForHighRisk: true,
  maxRetryAttempts: 3,
  validationTimeout: 30000,
  enableParallelValidation: true,
  cacheValidationResults: true,
  cacheExpiry: 3600000, // 1 hour
  enableRealTimeValidation: true,
  validationBatchSize: 100
};

export const DEFAULT_COMPLIANCE_SETTINGS: ComplianceSettings = {
  enableContinuousMonitoring: true,
  complianceCheckFrequency: 'daily',
  autoGenerateReports: true,
  reportRetentionPeriod: 2555, // 7 years in days
  enableAutomatedRemediation: false,
  requireEvidenceForCompliance: true,
  enableJurisdictionChecks: true,
  defaultJurisdiction: 'US',
  enableIndustrySpecificChecks: true,
  complianceScoreThreshold: 85
};

export const DEFAULT_AUDIT_SETTINGS: AuditSettings = {
  enableDetailedLogging: true,
  logRetentionPeriod: 3650, // 10 years in days
  enableImmutableLogs: true,
  logToExternalSystem: true,
  enableRealTimeAlerts: true,
  alertThresholds: {
    failedTransactions: 10,
    complianceViolations: 5,
    securityIncidents: 1
  },
  enableLogEncryption: true,
  enableLogSigning: true,
  enableLogBackup: true,
  backupFrequency: 'daily'
};

export const VALIDATION_RULES = {
  FINANCIAL_TRANSACTIONS: {
    requiredFields: ['amount', 'currency', 'description', 'fromAccount', 'toAccount'],
    maxAmount: 10000000,
    requireApproval: true,
    approvalLevels: 2,
    riskThreshold: 0.7
  },
  PAYROLL_TRANSACTIONS: {
    requiredFields: ['employeeId', 'payPeriod', 'grossPay', 'netPay', 'taxes'],
    maxAmount: 1000000,
    requireApproval: true,
    approvalLevels: 2,
    riskThreshold: 0.6
  },
  BOOKING_TRANSACTIONS: {
    requiredFields: ['customerId', 'serviceId', 'startTime', 'endTime', 'price'],
    maxAmount: 50000,
    requireApproval: false,
    approvalLevels: 1,
    riskThreshold: 0.3
  },
  INVENTORY_TRANSACTIONS: {
    requiredFields: ['productId', 'quantity', 'transactionType', 'reason'],
    maxAmount: 1000000,
    requireApproval: true,
    approvalLevels: 1,
    riskThreshold: 0.4
  }
};

export const COMPLIANCE_FRAMEWORKS = {
  SOX: {
    name: 'Sarbanes-Oxley Act',
    description: 'Financial reporting and internal controls',
    requirements: [
      'Internal controls over financial reporting',
      'Audit trail integrity',
      'Management certification',
      'Independent auditor verification'
    ],
    checkFrequency: 'quarterly',
    evidenceRequired: true,
    retentionPeriod: 2555 // 7 years
  },
  PCI_DSS: {
    name: 'Payment Card Industry Data Security Standard',
    description: 'Payment card data protection',
    requirements: [
      'Cardholder data protection',
      'Secure transmission',
      'Access control',
      'Network security',
      'Vulnerability management'
    ],
    checkFrequency: 'annually',
    evidenceRequired: true,
    retentionPeriod: 3650 // 10 years
  },
  GDPR: {
    name: 'General Data Protection Regulation',
    description: 'EU data protection regulation',
    requirements: [
      'Lawful basis for processing',
      'Data subject rights',
      'Data protection impact assessment',
      'Breach notification'
    ],
    checkFrequency: 'monthly',
    evidenceRequired: true,
    retentionPeriod: 2555 // 7 years
  },
  HIPAA: {
    name: 'Health Insurance Portability and Accountability Act',
    description: 'Healthcare data protection',
    requirements: [
      'Administrative safeguards',
      'Physical safeguards',
      'Technical safeguards',
      'Breach notification'
    ],
    checkFrequency: 'quarterly',
    evidenceRequired: true,
    retentionPeriod: 2555 // 7 years
  }
};

export const RISK_THRESHOLDS = {
  CRITICAL: 0.9,
  HIGH: 0.7,
  MEDIUM: 0.4,
  LOW: 0.2
};

export const VALIDATION_CATEGORIES = {
  DATA_INTEGRITY: 'data_integrity',
  BUSINESS_RULES: 'business_rules',
  COMPLIANCE: 'compliance',
  SECURITY: 'security',
  FINANCIAL: 'financial',
  OPERATIONAL: 'operational'
};

export const ERROR_SEVERITY_LEVELS = {
  CRITICAL: {
    level: 4,
    color: '#DC2626',
    requiresImmediateAction: true,
    autoBlock: true
  },
  HIGH: {
    level: 3,
    color: '#EA580C',
    requiresImmediateAction: true,
    autoBlock: false
  },
  MEDIUM: {
    level: 2,
    color: '#D97706',
    requiresImmediateAction: false,
    autoBlock: false
  },
  LOW: {
    level: 1,
    color: '#65A30D',
    requiresImmediateAction: false,
    autoBlock: false
  }
};

export const NOTIFICATION_SETTINGS = {
  EMAIL: {
    enabled: true,
    recipients: ['compliance@company.com', 'audit@company.com'],
    templates: {
      VALIDATION_FAILED: 'validation_failed_template',
      COMPLIANCE_VIOLATION: 'compliance_violation_template',
      HIGH_RISK_TRANSACTION: 'high_risk_transaction_template'
    }
  },
  SMS: {
    enabled: true,
    recipients: ['+1234567890'],
    criticalOnly: true
  },
  SLACK: {
    enabled: true,
    webhook: 'https://hooks.slack.com/services/...',
    channel: '#compliance-alerts'
  },
  WEBHOOK: {
    enabled: true,
    endpoints: [
      'https://api.company.com/compliance/webhook',
      'https://audit.company.com/webhook'
    ]
  }
};

export const REPORT_SCHEDULES = {
  DAILY_COMPLIANCE: {
    frequency: 'daily',
    time: '09:00',
    timezone: 'UTC',
    recipients: ['compliance@company.com'],
    format: 'pdf'
  },
  WEEKLY_AUDIT: {
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    time: '10:00',
    timezone: 'UTC',
    recipients: ['audit@company.com'],
    format: 'excel'
  },
  MONTHLY_RISK: {
    frequency: 'monthly',
    dayOfMonth: 1,
    time: '09:00',
    timezone: 'UTC',
    recipients: ['risk@company.com'],
    format: 'pdf'
  },
  QUARTERLY_EXECUTIVE: {
    frequency: 'quarterly',
    month: [1, 4, 7, 10],
    day: 15,
    time: '09:00',
    timezone: 'UTC',
    recipients: ['executives@company.com'],
    format: 'pdf'
  }
};

export const INTEGRATION_SETTINGS = {
  DATABASE: {
    connectionPool: {
      min: 5,
      max: 20,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000
    },
    retry: {
      maxRetries: 3,
      retryDelayMillis: 1000
    }
  },
  CACHE: {
    provider: 'redis',
    ttl: 3600,
    maxConnections: 10
  },
  MESSAGE_QUEUE: {
    provider: 'rabbitmq',
    exchange: 'compliance',
    queue: 'validation_queue',
    durable: true
  },
  EXTERNAL_APIS: {
    sanctions: {
      endpoint: 'https://api.sanctions.com/v1/check',
      timeout: 5000,
      retries: 2
    },
    credit: {
      endpoint: 'https://api.credit.com/v1/verify',
      timeout: 10000,
      retries: 3
    }
  }
};
