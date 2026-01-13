/**
 * Control Registry for Security Governance & Enforcement Layer
 * 
 * Authoritative registry of all security controls with enforcement
 * mechanisms and validation requirements.
 */

import { SecurityControl } from './types.js';

export class ControlRegistry {
  private controls: Map<string, SecurityControl> = new Map();

  /**
   * Initialize control registry
   */
  async initialize(): Promise<void> {
    this.loadDefaultControls();
  }

  /**
   * Add security control
   */
  add(control: Omit<SecurityControl, 'id' | 'createdAt' | 'updatedAt'>): SecurityControl {
    const securityControl: SecurityControl = {
      ...control,
      id: `SEC-${control.category.toUpperCase()}-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.controls.set(securityControl.id, securityControl);
    return securityControl;
  }

  /**
   * Get control by ID
   */
  get(id: string): SecurityControl | undefined {
    return this.controls.get(id);
  }

  /**
   * Get all controls
   */
  getAll(): SecurityControl[] {
    return Array.from(this.controls.values());
  }

  /**
   * Get controls by category
   */
  getByCategory(category: string): SecurityControl[] {
    return Array.from(this.controls.values()).filter(control => 
      control.category === category
    );
  }

  /**
   * Get controls by severity
   */
  getBySeverity(severity: SecurityControl['severity']): SecurityControl[] {
    return Array.from(this.controls.values()).filter(control => 
      control.severity === severity
    );
  }

  /**
   * Get controls by enforcement type
   */
  getByEnforcement(enforcement: SecurityControl['enforcement']): SecurityControl[] {
    return Array.from(this.controls.values()).filter(control => 
      control.enforcement === enforcement
    );
  }

  /**
   * Update control
   */
  update(id: string, updates: Partial<SecurityControl>): void {
    const control = this.controls.get(id);
    if (control) {
      Object.assign(control, updates, { updatedAt: new Date() });
    }
  }

  /**
   * Remove control
   */
  remove(id: string): boolean {
    return this.controls.delete(id);
  }

  /**
   * Search controls
   */
  search(query: string, filters?: {
    category?: string;
    severity?: SecurityControl['severity'];
    enforcement?: SecurityControl['enforcement'];
    status?: SecurityControl['status'];
  }): SecurityControl[] {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.controls.values()).filter(control => {
      // Text search
      const matchesQuery = 
        control.id.toLowerCase().includes(lowerQuery) ||
        control.description.toLowerCase().includes(lowerQuery) ||
        control.category.toLowerCase().includes(lowerQuery);

      // Apply filters
      if (filters?.category && control.category !== filters.category) return false;
      if (filters?.severity && control.severity !== filters.severity) return false;
      if (filters?.enforcement && control.enforcement !== filters.enforcement) return false;
      if (filters?.status && control.status !== filters.status) return false;

      return matchesQuery;
    });
  }

  private loadDefaultControls(): void {
    // Load default security controls from the extracted data
    const defaultControls: Omit<SecurityControl, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'SEC-AUTH-001',
        description: 'TLS enforced for all traffic',
        severity: 'CRITICAL',
        enforcement: 'CI',
        evidence: 'https_redirect + HSTS headers',
        status: 'REQUIRED',
        category: 'authentication',
        framework: ['OWASP', 'NIST'],
        implementation: {
          type: 'config',
          location: 'nginx/apache config',
          automated: true
        },
        validation: {
          type: 'automated',
          command: 'curl -I https://domain.com',
          frequency: 'deploy'
        }
      },
      {
        id: 'SEC-AI-007',
        description: 'External assistant forbidden from raw DB access',
        severity: 'CRITICAL',
        enforcement: 'RUNTIME',
        evidence: 'Facade APIs + sanitize layer',
        status: 'REQUIRED',
        category: 'ai-security',
        framework: ['NIST-AI'],
        implementation: {
          type: 'code',
          location: 'ai-service layer',
          automated: true
        },
        validation: {
          type: 'test',
          script: 'test-db-access-blocking.js',
          frequency: 'build'
        }
      },
      {
        id: 'SEC-DATA-004',
        description: 'Sensitive fields sanitized before external output',
        severity: 'CRITICAL',
        enforcement: 'RUNTIME',
        evidence: 'safeReturn() guard',
        status: 'REQUIRED',
        category: 'data-protection',
        framework: ['GDPR', 'OWASP'],
        implementation: {
          type: 'code',
          location: 'data-sanitizer.js',
          automated: true
        },
        validation: {
          type: 'test',
          script: 'test-data-sanitization.js',
          frequency: 'build'
        }
      },
      {
        id: 'SEC-AUTH-002',
        description: 'Multi-factor authentication required for admin access',
        severity: 'HIGH',
        enforcement: 'RUNTIME',
        evidence: 'MFA enforcement in auth service',
        status: 'REQUIRED',
        category: 'authentication',
        framework: ['NIST', 'SOC2'],
        implementation: {
          type: 'code',
          location: 'auth-service',
          automated: true
        },
        validation: {
          type: 'test',
          script: 'test-mfa-enforcement.js',
          frequency: 'build'
        }
      },
      {
        id: 'SEC-DATA-001',
        description: 'Encryption at rest for sensitive data',
        severity: 'CRITICAL',
        enforcement: 'RUNTIME',
        evidence: 'Database encryption enabled',
        status: 'REQUIRED',
        category: 'data-protection',
        framework: ['GDPR', 'HIPAA'],
        implementation: {
          type: 'config',
          location: 'database config',
          automated: true
        },
        validation: {
          type: 'automated',
          command: 'check-db-encryption.sh',
          frequency: 'deploy'
        }
      },
      {
        id: 'SEC-INFRA-001',
        description: 'Security headers configured on all endpoints',
        severity: 'HIGH',
        enforcement: 'CI',
        evidence: 'CSP, HSTS, X-Frame-Options headers',
        status: 'REQUIRED',
        category: 'infrastructure',
        framework: ['OWASP'],
        implementation: {
          type: 'config',
          location: 'web server config',
          automated: true
        },
        validation: {
          type: 'automated',
          command: 'security-headers-check.sh',
          frequency: 'deploy'
        }
      },
      {
        id: 'SEC-LOG-001',
        description: 'Security events logged with audit trail',
        severity: 'MEDIUM',
        enforcement: 'RUNTIME',
        evidence: 'Audit logging in all services',
        status: 'REQUIRED',
        category: 'logging',
        framework: ['SOC2', 'ISO27001'],
        implementation: {
          type: 'code',
          location: 'logging-service',
          automated: true
        },
        validation: {
          type: 'test',
          script: 'test-audit-logging.js',
          frequency: 'build'
        }
      },
      {
        id: 'SEC-MON-001',
        description: 'Real-time security monitoring enabled',
        severity: 'MEDIUM',
        enforcement: 'RUNTIME',
        evidence: 'SIEM integration active',
        status: 'RECOMMENDED',
        category: 'monitoring',
        framework: ['NIST'],
        implementation: {
          type: 'tool',
          location: 'monitoring-stack',
          automated: true
        },
        validation: {
          type: 'manual',
          frequency: 'scheduled'
        }
      }
    ];

    defaultControls.forEach(control => {
      this.add(control);
    });
  }
}

// Export singleton instance
export const controlRegistry = new ControlRegistry();
