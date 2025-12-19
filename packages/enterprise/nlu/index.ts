/**
 * NLU Package for Auth-spine
 * Natural Language Understanding with intelligent routing and LLM fallback
 */

export { NLUEngine } from './nlu-engine.js';
export { NLUIntegration } from './nlu-integration.js';

export type {
  NLUConfig,
  NLUIntent,
  NLUEngineResult
} from './nlu-engine.js';

export type {
  NLUIntegrationConfig,
  NLURoutingResult
} from './nlu-integration.js';

/**
 * Default NLU configuration for Auth-spine
 */
export const defaultNLUConfig: NLUConfig = {
  enabled: true,
  confidenceThreshold: 0.7,
  useLLMFallback: true,
  llmProvider: 'anthropic',
  maxRetries: 3,
  timeoutMs: 5000
};

/**
 * Default integration configuration
 */
export const defaultIntegrationConfig: NLUIntegrationConfig = {
  nlu: defaultNLUConfig,
  assistant: {
    enabled: true,
    engines: ['nlu-engine'],
    maxSuggestions: 10
  },
  routing: {
    confidenceThreshold: 0.6,
    enableLLMFallback: true,
    maxRetries: 2,
    timeoutMs: 8000
  },
  logging: {
    enabled: true,
    logLevel: 'info',
    includeMetrics: true
  }
};

/**
 * Quick factory function to create NLU integration
 */
export function createNLUIntegration(config?: Partial<NLUIntegrationConfig>): NLUIntegration {
  const { NLUIntegration } = require('./nlu-integration.js');
  const finalConfig = {
    nlu: { ...defaultNLUConfig, ...config?.nlu },
    assistant: { ...defaultIntegrationConfig.assistant, ...config?.assistant },
    routing: { ...defaultIntegrationConfig.routing, ...config?.routing },
    logging: { ...defaultIntegrationConfig.logging, ...config?.logging }
  };
  
  return new NLUIntegration(finalConfig);
}

/**
 * Business intents pre-configured for Auth-spine
 */
export const businessIntents = {
  booking: {
    create: 'booking_create',
    cancel: 'booking_cancel',
    reschedule: 'booking_reschedule',
    view: 'booking_view'
  },
  payment: {
    process: 'payment_process',
    refund: 'payment_refund',
    invoice: 'payment_invoice',
    balance: 'payment_balance'
  },
  inventory: {
    check: 'inventory_check',
    update: 'inventory_update',
    low_stock: 'inventory_low_stock'
  },
  payroll: {
    inquiry: 'payroll_inquiry',
    approve: 'payroll_approve',
    process: 'payroll_process'
  },
  reports: {
    generate: 'report_generate',
    view: 'report_view',
    export: 'report_export'
  },
  security: {
    alert: 'security_alert',
    audit: 'security_audit',
    compliance: 'security_compliance'
  }
} as const;

/**
 * Entity types for Auth-spine
 */
export const entityTypes = {
  temporal: ['date', 'time', 'duration'],
  location: ['location', 'venue', 'address'],
  person: ['person', 'staff', 'client', 'customer'],
  financial: ['amount', 'currency', 'price'],
  business: ['service', 'product', 'department', 'role']
} as const;
