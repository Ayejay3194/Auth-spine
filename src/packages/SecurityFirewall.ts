import type { NLUIntent, PromptContext } from '../core/types.js';

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: 'input' | 'output' | 'data' | 'access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  condition: (data: any) => boolean;
  action: 'block' | 'sanitize' | 'log' | 'alert';
  message?: string;
}

export interface SecurityContext {
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  requestCount: number;
  lastActivity: Date;
  riskScore: number;
  blockedAttempts: number;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: Date;
  type: 'violation' | 'blocked' | 'sanitized' | 'alert';
  ruleId: string;
  userId?: string;
  sessionId: string;
  ipAddress: string;
  data: any;
  action: string;
  riskScore: number;
}

export class SecurityFirewall {
  private rules: SecurityRule[] = [];
  private auditLog: SecurityAuditLog[] = [];
  private contexts: Map<string, SecurityContext> = new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousPatterns: RegExp[] = [];
  private maxRequestsPerMinute = 60;
  private maxRiskScore = 80;

  constructor() {
    this.initializeDefaultRules();
    this.initializeSuspiciousPatterns();
  }

  private initializeDefaultRules(): void {
    this.rules = [
      // Input validation rules
      {
        id: 'input-length-check',
        name: 'Input Length Validation',
        description: 'Prevents excessively long inputs',
        type: 'input',
        severity: 'medium',
        enabled: true,
        condition: (data: string) => Boolean(data && data.length > 1000),
        action: 'sanitize',
        message: 'Input too long, truncated to 1000 characters'
      },
      {
        id: 'sql-injection-detection',
        name: 'SQL Injection Detection',
        description: 'Detects and blocks SQL injection attempts',
        type: 'input',
        severity: 'critical',
        enabled: true,
        condition: (data: string) => {
          const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
            /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
            /(\b(OR|AND)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"])/i,
            /(--|;|\/\*|\*\/)/i
          ];
          return sqlPatterns.some(pattern => pattern.test(data));
        },
        action: 'block',
        message: 'SQL injection attempt detected and blocked'
      },
      {
        id: 'xss-detection',
        name: 'Cross-Site Scripting Detection',
        description: 'Detects and blocks XSS attempts',
        type: 'input',
        severity: 'high',
        enabled: true,
        condition: (data: string) => {
          const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe[^>]*>/gi,
            /<object[^>]*>/gi,
            /<embed[^>]*>/gi
          ];
          return xssPatterns.some(pattern => pattern.test(data));
        },
        action: 'sanitize',
        message: 'XSS attempt detected and sanitized'
      },
      {
        id: 'prompt-injection-detection',
        name: 'Prompt Injection Detection',
        description: 'Detects prompt injection attempts',
        type: 'input',
        severity: 'high',
        enabled: true,
        condition: (data: string) => {
          const injectionPatterns = [
            /ignore\s+previous\s+instructions/i,
            /system\s*:\s*/i,
            /assistant\s*:\s*/i,
            /\b(override|bypass|circumvent)\b/i,
            /\b(admin|root|god|superuser)\b/i
          ];
          return injectionPatterns.some(pattern => pattern.test(data));
        },
        action: 'sanitize',
        message: 'Prompt injection attempt detected and sanitized'
      },
      {
        id: 'pii-detection',
        name: 'Personal Information Detection',
        description: 'Detects and blocks sharing of personal information',
        type: 'input',
        severity: 'medium',
        enabled: true,
        condition: (data: string) => {
          const piiPatterns = [
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN
            /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
            /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/ // Phone number
          ];
          return piiPatterns.some(pattern => pattern.test(data));
        },
        action: 'sanitize',
        message: 'Personal information detected and removed'
      },

      // Data access rules
      {
        id: 'data-access-control',
        name: 'Data Access Control',
        description: 'Controls access to sensitive data',
        type: 'access',
        severity: 'high',
        enabled: true,
        condition: (context: SecurityContext) => {
          return context.riskScore > this.maxRiskScore;
        },
        action: 'block',
        message: 'Access denied due to high risk score'
      },
      {
        id: 'rate-limiting',
        name: 'Rate Limiting',
        description: 'Prevents excessive requests',
        type: 'access',
        severity: 'medium',
        enabled: true,
        condition: (context: SecurityContext) => {
          const now = new Date();
          const timeDiff = now.getTime() - context.lastActivity.getTime();
          const requestsPerMinute = context.requestCount / (timeDiff / 60000);
          return requestsPerMinute > this.maxRequestsPerMinute;
        },
        action: 'block',
        message: 'Rate limit exceeded, please try again later'
      },

      // Output validation rules
      {
        id: 'output-data-leak-prevention',
        name: 'Output Data Leak Prevention',
        description: 'Prevents sensitive data leakage in responses',
        type: 'output',
        severity: 'high',
        enabled: true,
        condition: (data: string) => {
          const sensitivePatterns = [
            /\b(password|secret|key|token|api_key)\s*[:=]\s*\S+/i,
            /\b(internal|confidential|private|restricted)\s+/i,
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN
            /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/ // Credit card
          ];
          return sensitivePatterns.some(pattern => pattern.test(data));
        },
        action: 'sanitize',
        message: 'Sensitive information removed from response'
      },

      // System integrity rules
      {
        id: 'system-command-detection',
        name: 'System Command Detection',
        description: 'Detects system command execution attempts',
        type: 'input',
        severity: 'critical',
        enabled: true,
        condition: (data: string) => {
          const commandPatterns = [
            /\b(eval|exec|system|shell|cmd|powershell)\b/i,
            /\$\([^)]*\)/, // Command substitution
            /`[^`]*`/, // Backticks
            /\|\s*(rm|del|format|fdisk|mkfs)/i // Dangerous commands
          ];
          return commandPatterns.some(pattern => pattern.test(data));
        },
        action: 'block',
        message: 'System command execution attempt blocked'
      }
    ];
  }

  private initializeSuspiciousPatterns(): void {
    this.suspiciousPatterns = [
      /\b(admin|root|god|superuser|elevated|privilege)\b/i,
      /\b(bypass|override|circumvent|disable)\b/i,
      /\b(exploit|vulnerability|backdoor|rootkit)\b/i,
      /\b(hack|crack|breach|intrusion)\b/i,
      /\b(malware|virus|trojan|spyware)\b/i
    ];
  }

  // Main security check method
  async checkSecurity(
    data: any,
    type: 'input' | 'output' | 'data' | 'access',
    context: SecurityContext
  ): Promise<{
    allowed: boolean;
    sanitizedData?: any;
    violations: SecurityRule[];
    riskScore: number;
    message?: string;
  }> {
    const violations: SecurityRule[] = [];
    let sanitizedData = data;
    let riskScore = context.riskScore;
    let finalMessage: string | undefined;

    // Update context
    this.updateContext(context);

    // Check IP blocklist
    if (this.blockedIPs.has(context.ipAddress)) {
      violations.push({
        id: 'ip-blocked',
        name: 'IP Address Blocked',
        description: 'IP address is blocked',
        type: 'access',
        severity: 'critical',
        enabled: true,
        condition: () => true,
        action: 'block',
        message: 'IP address is blocked'
      });
      return {
        allowed: false,
        violations,
        riskScore: 100,
        message: 'Access denied: IP address blocked'
      };
    }

    // Apply relevant rules
    const applicableRules = this.rules.filter(rule => 
      rule.enabled && rule.type === type
    );

    for (const rule of applicableRules) {
      try {
        if (rule.condition(data)) {
          violations.push(rule);
          riskScore += this.getSeverityScore(rule.severity);

          // Apply rule action
          switch (rule.action) {
            case 'block':
              this.logViolation(rule, context, data);
              return {
                allowed: false,
                violations,
                riskScore,
                message: rule.message || 'Access denied'
              };
            
            case 'sanitize':
              sanitizedData = this.sanitizeData(data, rule);
              this.logViolation(rule, context, data);
              finalMessage = rule.message;
              break;
            
            case 'log':
              this.logViolation(rule, context, data);
              break;
            
            case 'alert':
              this.logViolation(rule, context, data);
              this.sendAlert(rule, context, data);
              break;
          }
        }
      } catch (error) {
        console.error(`Security rule ${rule.id} failed:`, error);
      }
    }

    // Additional suspicious pattern detection
    if (typeof data === 'string' && this.containsSuspiciousPatterns(data)) {
      riskScore += 20;
      violations.push({
        id: 'suspicious-pattern',
        name: 'Suspicious Pattern Detected',
        description: 'Input contains suspicious patterns',
        type: 'input',
        severity: 'medium',
        enabled: true,
        condition: () => true,
        action: 'log',
        message: 'Suspicious pattern detected'
      });
    }

    // Update context risk score
    context.riskScore = riskScore;

    // Auto-block if risk score is too high
    if (riskScore > this.maxRiskScore) {
      this.blockIP(context.ipAddress);
      violations.push({
        id: 'high-risk-block',
        name: 'High Risk Block',
        description: 'Blocked due to high risk score',
        type: 'access',
        severity: 'critical',
        enabled: true,
        condition: () => true,
        action: 'block',
        message: 'Blocked due to high risk score'
      });
      return {
        allowed: false,
        violations,
        riskScore,
        message: 'Access denied: High risk score'
      };
    }

    return {
      allowed: true,
      sanitizedData,
      violations,
      riskScore,
      message: finalMessage
    };
  }

  private sanitizeData(data: any, rule: SecurityRule): any {
    if (typeof data === 'string') {
      let sanitized = data;
      
      switch (rule.id) {
        case 'input-length-check':
          sanitized = sanitized.substring(0, 1000);
          break;
        case 'xss-detection':
          sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '[SCRIPT_REMOVED]')
            .replace(/javascript:/gi, '[JS_REMOVED]')
            .replace(/on\w+\s*=/gi, '[EVENT_REMOVED]')
            .replace(/<iframe[^>]*>/gi, '[IFRAME_REMOVED]')
            .replace(/<object[^>]*>/gi, '[OBJECT_REMOVED]')
            .replace(/<embed[^>]*>/gi, '[EMBED_REMOVED]');
          break;
        case 'prompt-injection-detection':
          sanitized = sanitized.replace(/ignore\s+previous\s+instructions/gi, '[BLOCKED]')
            .replace(/system\s*:\s*/gi, '[BLOCKED]')
            .replace(/assistant\s*:\s*/gi, '[BLOCKED]')
            .replace(/\b(override|bypass|circumvent)\b/gi, '[BLOCKED]')
            .replace(/\b(admin|root|god|superuser)\b/gi, '[BLOCKED]');
          break;
        case 'pii-detection':
          sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REMOVED]')
            .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REMOVED]')
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REMOVED]')
            .replace(/\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/g, '[PHONE_REMOVED]');
          break;
        case 'output-data-leak-prevention':
          sanitized = sanitized.replace(/\b(password|secret|key|token|api_key)\s*[:=]\s*\S+/gi, '[REDACTED]')
            .replace(/\b(internal|confidential|private|restricted)\s+/gi, '[REDACTED]')
            .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED]')
            .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[REDACTED]');
          break;
      }
      
      return sanitized;
    }
    
    return data;
  }

  private containsSuspiciousPatterns(data: string): boolean {
    return this.suspiciousPatterns.some(pattern => pattern.test(data));
  }

  private updateContext(context: SecurityContext): void {
    context.lastActivity = new Date();
    context.requestCount++;
    this.contexts.set(context.sessionId, context);
  }

  private getSeverityScore(severity: string): number {
    switch (severity) {
      case 'low': return 5;
      case 'medium': return 15;
      case 'high': return 30;
      case 'critical': return 50;
      default: return 10;
    }
  }

  private logViolation(rule: SecurityRule, context: SecurityContext, data: any): void {
    const logEntry: SecurityAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: rule.action === 'block' ? 'blocked' : rule.action === 'sanitize' ? 'sanitized' : 'violation',
      ruleId: rule.id,
      userId: context.userId,
      sessionId: context.sessionId,
      ipAddress: context.ipAddress,
      data: typeof data === 'string' ? data.substring(0, 200) : data,
      action: rule.action,
      riskScore: context.riskScore
    };

    this.auditLog.push(logEntry);
    
    // Keep audit log size manageable
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }

  private sendAlert(rule: SecurityRule, context: SecurityContext, data: any): void {
    // In a real implementation, this would send alerts to security team
    console.warn(`SECURITY ALERT: ${rule.name} - ${context.ipAddress} - ${context.sessionId}`);
  }

  public blockIP(ipAddress: string): void {
    this.blockedIPs.add(ipAddress);
    console.warn(`IP blocked: ${ipAddress}`);
  }

  // Public API methods
  addRule(rule: SecurityRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) rule.enabled = true;
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) rule.enabled = false;
  }

  unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress);
  }

  getAuditLog(limit?: number): SecurityAuditLog[] {
    return limit ? this.auditLog.slice(-limit) : [...this.auditLog];
  }

  getSecurityStats(): {
    totalViolations: number;
    blockedIPs: number;
    activeContexts: number;
    averageRiskScore: number;
    violationsByType: Record<string, number>;
  } {
    const violationsByType: Record<string, number> = {};
    
    this.auditLog.forEach(log => {
      const rule = this.rules.find(r => r.id === log.ruleId);
      if (rule) {
        violationsByType[rule.type] = (violationsByType[rule.type] || 0) + 1;
      }
    });

    const averageRiskScore = this.contexts.size > 0
      ? Array.from(this.contexts.values()).reduce((sum, ctx) => sum + ctx.riskScore, 0) / this.contexts.size
      : 0;

    return {
      totalViolations: this.auditLog.length,
      blockedIPs: this.blockedIPs.size,
      activeContexts: this.contexts.size,
      averageRiskScore,
      violationsByType
    };
  }

  clearAuditLog(): void {
    this.auditLog = [];
  }

  // Create security context from request
  createContext(
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    userId?: string
  ): SecurityContext {
    const existingContext = this.contexts.get(sessionId);
    
    if (existingContext) {
      return existingContext;
    }

    const context: SecurityContext = {
      userId,
      sessionId,
      ipAddress,
      userAgent,
      requestCount: 0,
      lastActivity: new Date(),
      riskScore: 0,
      blockedAttempts: 0
    };

    this.contexts.set(sessionId, context);
    return context;
  }
}
