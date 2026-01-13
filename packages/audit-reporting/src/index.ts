export * from './types';
export * from './logger';
export * from './storage';
export * from './analytics';
export * from './report-generator';
export * from './consolidator';
export * from './hooks';

export { auditLogger } from './logger';
export { auditStorage } from './storage';
export { auditAnalytics } from './analytics';
export { reportGenerator } from './report-generator';
export { auditConsolidator } from './consolidator';

import { auditLogger } from './logger';
import { auditStorage } from './storage';
import { auditAnalytics } from './analytics';
import { reportGenerator } from './report-generator';
import { auditConsolidator } from './consolidator';

export const AuditReporting = {
  logger: auditLogger,
  storage: auditStorage,
  analytics: auditAnalytics,
  reportGenerator,
  consolidator: auditConsolidator,
};

export default AuditReporting;
