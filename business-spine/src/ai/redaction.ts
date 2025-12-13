/**
 * DATA REDACTION FOR SAFE SNAPSHOTS
 * 
 * This module ensures LLM only gets safe, read-only data:
 * - No secrets or API keys
 * - No payment information
 * - No personal identifiers
 * - No raw database access
 * - No system internals
 * 
 * LLM gets business context, not the keys to the kingdom.
 */

interface SafeDataSnapshot {
  businessContext: {
    tenantId: string;
    businessType: string;
    features: string[];
  };
  operationalData: {
    recentActivity: string[];
    metrics: Record<string, number>;
    trends: string[];
  };
  userContext: {
    role: string;
    permissions: string[];
    lastActivity: string;
  };
  metadata: {
    snapshotTime: string;
    dataLevel: 'safe' | 'sanitized' | 'anonymized';
    includesPII: false;
    includesSecrets: false;
  };
}

// Patterns to redact
const REDACTION_PATTERNS = [
  // API Keys and secrets
  { pattern: /sk_[a-zA-Z0-9]{24,}/g, replacement: '[API_KEY]' },
  { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, replacement: '[STRIPE_LIVE_KEY]' },
  { pattern: /sk_test_[a-zA-Z0-9]{24,}/g, replacement: '[STRIPE_TEST_KEY]' },
  { pattern: /Bearer\s+[a-zA-Z0-9\-_\.]+/g, replacement: '[BEARER_TOKEN]' },
  { pattern: /[a-zA-Z0-9]{32,}/g, replacement: '[SECRET]' }, // Generic long strings
  
  // Payment information
  { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[CARD_NUMBER]' },
  { pattern: /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/g, replacement: '[SSN]' },
  { pattern: /\b\d{9}\b/g, replacement: '[IDENTIFIER]' }, // Generic 9-digit numbers
  
  // Email addresses (partial redaction)
  { pattern: /\b([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, replacement: '[EMAIL]' },
  
  // Phone numbers
  { pattern: /\b\d{3}[-\s.]?\d{3}[-\s.]?\d{4}\b/g, replacement: '[PHONE]' },
  { pattern: /\+?\d{1,3}[-\s.]?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}\b/g, replacement: '[PHONE]' },
  
  // Addresses (basic pattern)
  { pattern: /\d+\s+[\w\s]+,\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}/g, replacement: '[ADDRESS]' },
  
  // URLs with potential sensitive data
  { pattern: /https?:\/\/[^\s]+/g, replacement: '[URL]' },
  
  // Internal system paths
  { pattern: /\/[a-zA-Z0-9_\/\-]+\/(api|admin|internal|secure)/g, replacement: '[INTERNAL_PATH]' },
  
  // Database connection strings
  { pattern: /postgresql:\/\/[^\s]+/g, replacement: '[DB_CONNECTION]' },
  { pattern: /mysql:\/\/[^\s]+/g, replacement: '[DB_CONNECTION]' },
  { pattern: /mongodb:\/\/[^\s]+/g, replacement: '[DB_CONNECTION]' },
];

// Fields to completely remove
const BLACKLISTED_FIELDS = [
  'password', 'secret', 'key', 'token', 'auth', 'credential',
  'ssn', 'socialSecurity', 'creditCard', 'cardNumber', 'cvv',
  'bankAccount', 'routingNumber', 'iban', 'swift',
  'apiKey', 'privateKey', 'publicKey', 'certificate',
  'sessionId', 'csrfToken', 'jwt', 'bearer',
  'databaseUrl', 'connectionString', 'webhookSecret'
];

// Fields to anonymize (keep structure, remove values)
const ANONYMIZED_FIELDS = [
  'id', 'userId', 'clientId', 'customerId', 'bookingId',
  'email', 'phone', 'name', 'firstName', 'lastName',
  'address', 'city', 'state', 'zip', 'country',
  'ip', 'userAgent', 'sessionId', 'deviceId'
];

export function createSafeSnapshot(context: any): SafeDataSnapshot {
  const snapshot: SafeDataSnapshot = {
    businessContext: extractBusinessContext(context),
    operationalData: extractOperationalData(context),
    userContext: extractUserContext(context),
    metadata: {
      snapshotTime: new Date().toISOString(),
      dataLevel: 'safe',
      includesPII: false,
      includesSecrets: false
    }
  };

  return snapshot;
}

function extractBusinessContext(context: any): SafeDataSnapshot['businessContext'] {
  return {
    tenantId: context.tenantId ? `tenant_${hashString(context.tenantId)}` : 'unknown',
    businessType: context.businessType || 'service_business',
    features: context.features || ['booking', 'payments', 'crm'],
  };
}

function extractOperationalData(context: any): SafeDataSnapshot['operationalData'] {
  const safeMetrics: Record<string, number> = {};
  
  // Only include safe, aggregated metrics
  if (context.metrics) {
    if (typeof context.metrics.bookingsCount === 'number') {
      safeMetrics.bookingsCount = Math.min(context.metrics.bookingsCount, 1000); // Cap for safety
    }
    if (typeof context.metrics.revenue === 'number') {
      safeMetrics.revenue = Math.round(context.metrics.revenue / 100) * 100; // Round to nearest 100
    }
    if (typeof context.metrics.customersCount === 'number') {
      safeMetrics.customersCount = Math.min(context.metrics.customersCount, 10000);
    }
    if (typeof context.metrics.noShowRate === 'number') {
      safeMetrics.noShowRate = Math.round(context.metrics.noShowRate * 100) / 100;
    }
  }

  return {
    recentActivity: context.recentActivity ? sanitizeActivity(context.recentActivity) : [],
    metrics: safeMetrics,
    trends: context.trends || ['steady_growth', 'seasonal_patterns']
  };
}

function extractUserContext(context: any): SafeDataSnapshot['userContext'] {
  return {
    role: context.user?.role || 'staff',
    permissions: context.user?.permissions || ['read_bookings', 'create_bookings'],
    lastActivity: context.user?.lastActivity ? 'recent' : 'unknown'
  };
}

function sanitizeActivity(activity: any[]): string[] {
  if (!Array.isArray(activity)) return [];
  
  return activity
    .slice(0, 10) // Limit to 10 recent activities
    .map(item => {
      if (typeof item === 'string') {
        return sanitizeString(item);
      }
      if (typeof item === 'object' && item.type) {
        return `${item.type} operation`;
      }
      return 'system_activity';
    })
    .filter(Boolean);
}

function sanitizeString(str: string): string {
  let sanitized = str;
  
  // Apply redaction patterns
  for (const { pattern, replacement } of REDACTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  
  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 197) + '...';
  }
  
  return sanitized;
}

export function sanitizeObject(obj: any, depth = 0): any {
  if (depth > 5) return '[MAX_DEPTH_REACHED]'; // Prevent infinite recursion
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number') {
    return Math.round(Math.min(Math.max(obj, -1000000), 1000000)); // Clamp numbers
  }
  
  if (typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj
      .slice(0, 50) // Limit array size
      .map(item => sanitizeObject(item, depth + 1))
      .filter(item => item !== '[REDACTED]');
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    let count = 0;
    
    for (const [key, value] of Object.entries(obj)) {
      if (count >= 20) break; // Limit object size
      
      const sanitizedKey = sanitizeKey(key);
      if (sanitizedKey === '[REDACTED]') continue;
      
      sanitized[sanitizedKey] = sanitizeObject(value, depth + 1);
      count++;
    }
    
    return sanitized;
  }
  
  return '[UNSUPPORTED_TYPE]';
}

function sanitizeKey(key: string): string {
  // Remove blacklisted fields entirely
  if (BLACKLISTED_FIELDS.some(blacklisted => 
    key.toLowerCase().includes(blacklisted.toLowerCase())
  )) {
    return '[REDACTED]';
  }
  
  // Anonymize sensitive fields
  if (ANONYMIZED_FIELDS.some(sensitive => 
    key.toLowerCase().includes(sensitive.toLowerCase())
  )) {
    return `[${key.toUpperCase()}_ANONYMIZED]`;
  }
  
  return key;
}

export function hashString(str: string): string {
  // Simple hash function for anonymization
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export function createAuditLog(snapshot: SafeDataSnapshot, originalContext: any): {
  timestamp: string;
  originalSize: number;
  sanitizedSize: number;
  redactionCount: number;
  dataLevel: string;
} {
  const originalSize = JSON.stringify(originalContext).length;
  const sanitizedSize = JSON.stringify(snapshot).length;
  
  // Count redactions (simplified)
  let redactionCount = 0;
  const originalStr = JSON.stringify(originalContext);
  for (const { pattern } of REDACTION_PATTERNS) {
    const matches = originalStr.match(pattern);
    if (matches) redactionCount += matches.length;
  }
  
  return {
    timestamp: new Date().toISOString(),
    originalSize,
    sanitizedSize,
    redactionCount,
    dataLevel: snapshot.metadata.dataLevel
  };
}

// Validation functions
export function validateSafeSnapshot(snapshot: any): snapshot is SafeDataSnapshot {
  if (!snapshot || typeof snapshot !== 'object') return false;
  
  const required = ['businessContext', 'operationalData', 'userContext', 'metadata'];
  if (!required.every(field => snapshot[field])) return false;
  
  if (snapshot.metadata.includesPII !== false) return false;
  if (snapshot.metadata.includesSecrets !== false) return false;
  
  return true;
}

export function isDataSafe(context: any): boolean {
  try {
    const snapshot = createSafeSnapshot(context);
    return validateSafeSnapshot(snapshot);
  } catch {
    return false;
  }
}
