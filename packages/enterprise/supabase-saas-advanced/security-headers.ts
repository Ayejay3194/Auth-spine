/**
 * Security Headers for Supabase SaaS Advanced Pack
 * 
 * Provides comprehensive security headers for web applications
 * including CSP, HSTS, and other security protections.
 */

import { SecurityHeader } from './types.js';

export class SecurityHeadersManager {
  private headers: Map<string, SecurityHeader> = new Map();
  private initialized = false;

  /**
   * Initialize security headers
   */
  async initialize(): Promise<void> {
    this.loadDefaultHeaders();
    this.initialized = true;
  }

  /**
   * Get all security headers
   */
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    this.headers.forEach((header, name) => {
      if (header.enabled) {
        headers[name] = header.value;
      }
    });

    return headers;
  }

  /**
   * Get header by name
   */
  getHeader(name: string): SecurityHeader | undefined {
    return this.headers.get(name);
  }

  /**
   * Add or update security header
   */
  setHeader(header: Omit<SecurityHeader, 'description'>): SecurityHeader {
    const securityHeader: SecurityHeader = {
      ...header,
      description: this.getHeaderDescription(header.name)
    };

    this.headers.set(header.name, securityHeader);
    return securityHeader;
  }

  /**
   * Enable/disable header
   */
  toggleHeader(name: string, enabled: boolean): void {
    const header = this.headers.get(name);
    if (header) {
      header.enabled = enabled;
    }
  }

  /**
   * Delete header
   */
  deleteHeader(name: string): boolean {
    return this.headers.delete(name);
  }

  /**
   * Generate CSP header for tenant
   */
  generateCSP(tenantId: string, options?: {
    customDomains?: string[];
    allowInline?: boolean;
    allowEval?: boolean;
  }): string {
    const customDomains = options?.customDomains || [];
    const allowInline = options?.allowInline || false;
    const allowEval = options?.allowEval || false;

    const defaultDomains = [
      "'self'",
      `${tenantId}.supabase.co`,
      `${tenantId}.supabase.co:54321`, // Development
      'https://*.supabase.co'
    ];

    const domains = [...defaultDomains, ...customDomains].join(' ');

    const directives = [
      `default-src ${domains}`,
      `script-src ${domains}${allowInline ? " 'unsafe-inline'" : ""}${allowEval ? " 'unsafe-eval'" : ""}`,
      `style-src ${domains}${allowInline ? " 'unsafe-inline'" : ""}`,
      `img-src ${domains} data: blob:`,
      `font-src ${domains}`,
      `connect-src ${domains} wss://${tenantId}.supabase.co ws://${tenantId}.supabase.co:54321`,
      `media-src ${domains}`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`
    ];

    return directives.join('; ');
  }

  /**
   * Get Next.js middleware configuration
   */
  getNextMiddlewareConfig(): string {
    return `
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CSP header (dynamic based on tenant)
  const tenantId = request.headers.get('x-tenant-id') || 'default';
  const csp = \`default-src 'self' \${tenantId}.supabase.co https://*.supabase.co; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' wss://\${tenantId}.supabase.co; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';\`;
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
    `.trim();
  }

  private loadDefaultHeaders(): void {
    // Content Security Policy
    this.setHeader({
      name: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
      enabled: true,
      csp: true
    });

    // HTTP Strict Transport Security
    this.setHeader({
      name: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
      enabled: true,
      csp: false
    });

    // X-Frame-Options
    this.setHeader({
      name: 'X-Frame-Options',
      value: 'DENY',
      enabled: true,
      csp: false
    });

    // X-Content-Type-Options
    this.setHeader({
      name: 'X-Content-Type-Options',
      value: 'nosniff',
      enabled: true,
      csp: false
    });

    // X-XSS-Protection
    this.setHeader({
      name: 'X-XSS-Protection',
      value: '1; mode=block',
      enabled: true,
      csp: false
    });

    // Referrer Policy
    this.setHeader({
      name: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
      enabled: true,
      csp: false
    });

    // Permissions Policy
    this.setHeader({
      name: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      enabled: true,
      csp: false
    });

    // X-DNS-Prefetch-Control
    this.setHeader({
      name: 'X-DNS-Prefetch-Control',
      value: 'on',
      enabled: true,
      csp: false
    });

    // Cross-Origin Embedder Policy
    this.setHeader({
      name: 'Cross-Origin-Embedder-Policy',
      value: 'require-corp',
      enabled: false,
      csp: false
    });

    // Cross-Origin Opener Policy
    this.setHeader({
      name: 'Cross-Origin-Opener-Policy',
      value: 'same-origin',
      enabled: false,
      csp: false
    });

    // Cross-Origin Resource Policy
    this.setHeader({
      name: 'Cross-Origin-Resource-Policy',
      value: 'same-origin',
      enabled: true,
      csp: false
    });
  }

  private getHeaderDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'Content-Security-Policy': 'Prevents Cross-Site Scripting (XSS) and data injection attacks',
      'Strict-Transport-Security': 'Enforces HTTPS connections and prevents protocol downgrade attacks',
      'X-Frame-Options': 'Protects against clickjacking attacks by controlling iframe embedding',
      'X-Content-Type-Options': 'Prevents MIME-type sniffing attacks',
      'X-XSS-Protection': 'Enables browser XSS filtering protection',
      'Referrer-Policy': 'Controls how much referrer information is sent with requests',
      'Permissions-Policy': 'Controls access to browser features and APIs',
      'X-DNS-Prefetch-Control': 'Controls DNS prefetching to improve privacy',
      'Cross-Origin-Embedder-Policy': 'Controls cross-origin resource embedding',
      'Cross-Origin-Opener-Policy': 'Controls cross-origin window access',
      'Cross-Origin-Resource-Policy': 'Controls cross-origin resource access'
    };

    return descriptions[name] || 'Security header for web application protection';
  }
}

// Export singleton instance
export const securityHeaders = new SecurityHeadersManager();
