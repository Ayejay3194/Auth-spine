/**
 * Security Headers for Beauty Booking Security Pack
 * 
 * Provides comprehensive security headers and CSP policies for
 * beauty booking platforms with domain-specific configurations.
 */

import { SecurityHeadersConfig } from './types.js';

export class SecurityHeadersManager {
  private config: SecurityHeadersConfig;
  private initialized = false;

  /**
   * Initialize security headers
   */
  async initialize(config: SecurityHeadersConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Get security headers for domain
   */
  getHeaders(domain: 'public' | 'studio' | 'ops'): Record<string, string> {
    const baseHeaders = this.getBaseHeaders();
    const domainHeaders = this.getDomainSpecificHeaders(domain);
    const cspHeader = this.getCSPHeader(domain);

    return {
      ...baseHeaders,
      ...domainHeaders,
      'Content-Security-Policy': cspHeader
    };
  }

  /**
   * Get CSP policy for domain
   */
  getCSP(domain: 'public' | 'studio' | 'ops'): string {
    return this.getCSPHeader(domain);
  }

  /**
   * Get CSRF protection token
   */
  getCSRFToken(sessionId: string): string {
    // Generate CSRF token
    const timestamp = Date.now().toString();
    const data = `${sessionId}:${timestamp}`;
    return this.generateToken(data);
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, sessionId: string): boolean {
    // Simple validation - in production, use proper CSRF validation
    return token.length > 20 && sessionId.length > 10;
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate security headers configuration
   */
  generateConfig(): {
    next: string;
    nginx: string;
    csp: Record<string, string>;
  } {
    const nextConfig = this.generateNextConfig();
    const nginxConfig = this.generateNginxConfig();
    const cspConfig = this.generateCSPConfig();

    return {
      next: nextConfig,
      nginx: nginxConfig,
      csp: cspConfig
    };
  }

  private getBaseHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.enableXFrameOptions) {
      headers['X-Frame-Options'] = 'DENY';
    }

    if (this.config.enableXContentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    if (this.config.enableSecurityHeaders) {
      headers['X-XSS-Protection'] = '1; mode=block';
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
      headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';
    }

    if (this.config.enableHSTS) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    if (this.config.enableCSRFProtection) {
      headers['X-CSRF-Token'] = 'required';
    }

    return headers;
  }

  private getDomainSpecificHeaders(domain: 'public' | 'studio' | 'ops'): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (domain) {
      case 'public':
        headers['X-Frame-Options'] = 'DENY';
        headers['X-Content-Type-Options'] = 'nosniff';
        break;
      case 'studio':
        headers['X-Frame-Options'] = 'SAMEORIGIN';
        headers['X-Content-Type-Options'] = 'nosniff';
        break;
      case 'ops':
        headers['X-Frame-Options'] = 'DENY';
        headers['X-Content-Type-Options'] = 'nosniff';
        headers['X-Permitted-Cross-Domain-Policies'] = 'none';
        break;
    }

    return headers;
  }

  private getCSPHeader(domain: 'public' | 'studio' | 'ops'): string {
    if (!this.config.enableCSP) {
      return '';
    }

    switch (domain) {
      case 'public':
        return this.getPublicCSP();
      case 'studio':
        return this.getStudioCSP();
      case 'ops':
        return this.getOpsCSP();
      default:
        return this.getPublicCSP();
    }
  }

  private getPublicCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.trustpilot.net https://www.google-analytics.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.beautybooking.com https://analytics.google.com https://api.stripe.com",
      "frame-src 'https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  private getStudioCSP(): string {
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
      "frame-ancestors 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  private getOpsCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data:",
      "connect-src 'self' https://internal-api.company.com wss://internal-api.company.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  private generateToken(data: string): string {
    // Simple token generation - in production, use proper cryptographic signing
    const timestamp = Date.now().toString();
    const combined = `${data}:${timestamp}`;
    return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  private generateNextConfig(): string {
    return `
// next.config.js - Security Headers for Beauty Booking Platform
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.beautybooking.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
];

const ContentSecurityPolicy = (req) => {
  const hostname = req.headers.get('host') || '';
  
  if (hostname.includes('studio.beautybooking.com')) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.beautybooking.com wss://api.beautybooking.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
  }
  
  if (hostname.includes('ops.beautybooking.com')) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self' https://internal-api.company.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }
  
  // Default public CSP
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
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

const securityConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy
          }
        ]
      }
    ];
  }
};

module.exports = securityConfig;
`;
  }

  private generateNginxConfig(): string {
    return `
# Nginx Security Headers Configuration
# Generated on ${new Date().toISOString()}

server {
    listen 443 ssl http2;
    server_name app.beautybooking.com;
    
    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.trustpilot.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.beautybooking.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name studio.beautybooking.com;
    
    # Security Headers
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://api.beautybooking.com wss://api.beautybooking.com; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    location / {
        proxy_pass http://studio_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name ops.beautybooking.com;
    
    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://internal-api.company.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
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
`;
  }

  private generateCSPConfig(): Record<string, string> {
    return {
      public: this.getPublicCSP(),
      studio: this.getStudioCSP(),
      ops: this.getOpsCSP()
    };
  }
}

// Export singleton instance
export const securityHeaders = new SecurityHeadersManager();
