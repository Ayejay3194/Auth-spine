/**
 * Separation Controls for Beauty Booking Security Pack
 * 
 * Provides domain separation between public, studio, and operational
 * domains with proper isolation and security controls.
 */

import { SeparationConfig, DomainContext } from './types.js';

export class SeparationControlsManager {
  private config: SeparationConfig;
  private domainContexts: Map<string, DomainContext> = new Map();
  private initialized = false;

  /**
   * Initialize separation controls
   */
  async initialize(config: SeparationConfig): Promise<void> {
    this.config = config;
    this.loadDomainContexts();
    this.initialized = true;
  }

  /**
   * Get domain context for hostname
   */
  async getDomainContext(hostname: string): Promise<{
    domain: 'public' | 'studio' | 'ops';
    context: DomainContext;
    securityHeaders: Record<string, string>;
  }> {
    const domain = this.identifyDomain(hostname);
    const context = this.domainContexts.get(domain);
    
    if (!context) {
      throw new Error(`No context found for domain: ${domain}`);
    }

    return {
      domain,
      context,
      securityHeaders: context.securityHeaders
    };
  }

  /**
   * Validate domain separation
   */
  async validateSeparation(): Promise<{
    valid: boolean;
    violations: Array<{
      domain: string;
      issue: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  }> {
    const violations = [];

    // Check cross-domain isolation
    if (this.config.enableCrossDomainIsolation) {
      for (const [domain, context] of this.domainContexts.entries()) {
        if (context.isolationLevel !== 'strict') {
          violations.push({
            domain,
            issue: 'Isolation level is not strict',
            severity: 'medium'
          });
        }
      }
    }

    // Check allowed origins
    for (const [domain, context] of this.domainContexts.entries()) {
      if (context.allowedOrigins.length === 0) {
        violations.push({
          domain,
          issue: 'No allowed origins configured',
          severity: 'high'
        });
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate separation configuration
   */
  generateSeparationConfig(): {
    nginx: string;
    csp: Record<string, string>;
    isolation: Record<string, any>;
  } {
    const nginxConfig = this.generateNginxConfig();
    const cspConfig = this.generateCSPConfig();
    const isolationConfig = this.generateIsolationConfig();

    return {
      nginx: nginxConfig,
      csp: cspConfig,
      isolation: isolationConfig
    };
  }

  private identifyDomain(hostname: string): 'public' | 'studio' | 'ops' {
    if (hostname.includes(this.config.domains.public)) {
      return 'public';
    }
    if (hostname.includes(this.config.domains.studio)) {
      return 'studio';
    }
    if (hostname.includes(this.config.domains.ops)) {
      return 'ops';
    }
    
    // Default to public for unknown domains
    return 'public';
  }

  private loadDomainContexts(): void {
    // Public domain context
    this.domainContexts.set('public', {
      domain: 'public',
      hostname: this.config.domains.public,
      isolationLevel: 'strict',
      allowedOrigins: [
        `https://${this.config.domains.public}`,
        `https://www.${this.config.domains.public}`
      ],
      securityHeaders: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': this.generatePublicCSP(),
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
      },
      cspPolicy: this.generatePublicCSP()
    });

    // Studio domain context
    this.domainContexts.set('studio', {
      domain: 'studio',
      hostname: this.config.domains.studio,
      isolationLevel: 'strict',
      allowedOrigins: [
        `https://${this.config.domains.studio}`,
        `https://${this.config.domains.public}` // Allow public domain for booking flows
      ],
      securityHeaders: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': this.generateStudioCSP(),
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
      },
      cspPolicy: this.generateStudioCSP()
    });

    // Operations domain context
    this.domainContexts.set('ops', {
      domain: 'ops',
      hostname: this.config.domains.ops,
      isolationLevel: 'moderate',
      allowedOrigins: [
        `https://${this.config.domains.ops}`,
        'https://internal.company.com' // Internal corporate domain
      ],
      securityHeaders: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': this.generateOpsCSP(),
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
      },
      cspPolicy: this.generateOpsCSP()
    });
  }

  private generatePublicCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.trustpilot.net https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.beautybooking.com https://analytics.google.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  private generateStudioCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.beautybooking.com wss://api.beautybooking.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  private generateOpsCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data:",
      "connect-src 'self' https://internal-api.company.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  private generateNginxConfig(): string {
    return `
# Beauty Booking Platform - Domain Separation Configuration
# Generated on ${new Date().toISOString()}

# Public domain configuration
server {
    listen 443 ssl http2;
    server_name ${this.config.domains.public};
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/beautybooking.crt;
    ssl_certificate_key /etc/ssl/private/beautybooking.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "${this.generatePublicCSP()}" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Rate limiting
    limit_req zone=public_limit burst=20 nodelay;
    
    # Cross-domain restrictions
    add_header Access-Control-Allow-Origin "https://${this.config.domains.public}" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    
    location / {
        proxy_pass http://public_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Studio domain configuration
server {
    listen 443 ssl http2;
    server_name ${this.config.domains.studio};
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/beautybooking.crt;
    ssl_certificate_key /etc/ssl/private/beautybooking.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "${this.generateStudioCSP()}" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Rate limiting
    limit_req zone=studio_limit burst=50 nodelay;
    
    # Cross-domain restrictions
    add_header Access-Control-Allow-Origin "https://${this.config.domains.studio} https://${this.config.domains.public}" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    
    location / {
        proxy_pass http://studio_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Operations domain configuration
server {
    listen 443 ssl http2;
    server_name ${this.config.domains.ops};
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/beautybooking.crt;
    ssl_certificate_key /etc/ssl/private/beautybooking.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "${this.generateOpsCSP()}" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Rate limiting
    limit_req zone=ops_limit burst=100 nodelay;
    
    # IP restrictions for ops domain
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
    
    location / {
        proxy_pass http://ops_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=public_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=studio_limit:10m rate=50r/s;
limit_req_zone $binary_remote_addr zone=ops_limit:10m rate=100r/s;
`;
  }

  private generateCSPConfig(): Record<string, string> {
    return {
      public: this.generatePublicCSP(),
      studio: this.generateStudioCSP(),
      ops: this.generateOpsCSP()
    };
  }

  private generateIsolationConfig(): Record<string, any> {
    return {
      enableCrossDomainIsolation: this.config.enableCrossDomainIsolation,
      enableNetworkSegmentation: this.config.enableNetworkSegmentation,
      domains: this.config.domains,
      isolationLevels: {
        public: 'strict',
        studio: 'strict',
        ops: 'moderate'
      },
      allowedOrigins: {
        public: [`https://${this.config.domains.public}`],
        studio: [`https://${this.config.domains.studio}`, `https://${this.config.domains.public}`],
        ops: [`https://${this.config.domains.ops}`, 'https://internal.company.com']
      }
    };
  }
}

// Export singleton instance
export const separationControls = new SeparationControlsManager();
