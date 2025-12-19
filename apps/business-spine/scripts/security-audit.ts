#!/usr/bin/env tsx

/**
 * Security Audit Checklist for Auth-Spine
 * Run this script to perform comprehensive security checks
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../src/lib/logger';
import { config } from '../src/lib/config';

interface SecurityCheck {
  name: string;
  description: string;
  check: () => Promise<{ passed: boolean; message: string; details?: any }>;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

class SecurityAuditor {
  private checks: SecurityCheck[] = [];
  private results: Array<{ check: SecurityCheck; result: any }> = [];

  constructor() {
    this.setupChecks();
  }

  private setupChecks() {
    this.checks = [
      {
        name: 'Environment Variables Security',
        description: 'Check for hardcoded secrets and proper env var configuration',
        severity: 'critical',
        check: this.checkEnvironmentVariables.bind(this),
      },
      {
        name: 'CORS Configuration',
        description: 'Verify CORS settings are properly configured',
        severity: 'high',
        check: this.checkCORSConfiguration.bind(this),
      },
      {
        name: 'Rate Limiting',
        description: 'Ensure rate limiting is enabled and configured',
        severity: 'high',
        check: this.checkRateLimiting.bind(this),
      },
      {
        name: 'Database Security',
        description: 'Check database connection security and query safety',
        severity: 'high',
        check: this.checkDatabaseSecurity.bind(this),
      },
      {
        name: 'JWT Configuration',
        description: 'Verify JWT secrets and configuration are secure',
        severity: 'critical',
        check: this.checkJWTConfiguration.bind(this),
      },
      {
        name: 'Password Security',
        description: 'Check password hashing and policies',
        severity: 'high',
        check: this.checkPasswordSecurity.bind(this),
      },
      {
        name: 'Dependency Vulnerabilities',
        description: 'Scan for known vulnerabilities in dependencies',
        severity: 'high',
        check: this.checkDependencyVulnerabilities.bind(this),
      },
      {
        name: 'File Upload Security',
        description: 'Verify file upload restrictions and validation',
        severity: 'medium',
        check: this.checkFileUploadSecurity.bind(this),
      },
      {
        name: 'Session Security',
        description: 'Check session configuration and security',
        severity: 'high',
        check: this.checkSessionSecurity.bind(this),
      },
      {
        name: 'HTTPS Configuration',
        description: 'Ensure HTTPS is properly configured in production',
        severity: 'critical',
        check: this.checkHTTPSConfiguration.bind(this),
      },
      {
        name: 'Input Validation',
        description: 'Check for proper input validation and sanitization',
        severity: 'high',
        check: this.checkInputValidation.bind(this),
      },
      {
        name: 'Error Handling',
        description: 'Verify error messages don\'t leak sensitive information',
        severity: 'medium',
        check: this.checkErrorHandling.bind(this),
      },
      {
        name: 'Logging Security',
        description: 'Ensure logs don\'t contain sensitive data',
        severity: 'medium',
        check: this.checkLoggingSecurity.bind(this),
      },
    ];
  }

  private async checkEnvironmentVariables() {
    const issues: string[] = [];

    // Check for hardcoded secrets in source code
    try {
      const grepResult = execSync('grep -r "password\\|secret\\|key\\|token" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" || true', { encoding: 'utf8' });
      if (grepResult.includes('password') || grepResult.includes('secret')) {
        issues.push('Potential hardcoded secrets found in source code');
      }
    } catch (error) {
      // Grep failed, which is good (no matches)
    }

    // Check required environment variables
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        issues.push(`Missing required environment variable: ${varName}`);
      }
    }

    // Check JWT secret strength
    if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
      issues.push('JWT_SECRET should be at least 32 characters long');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Environment variables are properly configured' : `Found ${issues.length} issues`,
      details: { issues },
    };
  }

  private async checkCORSConfiguration() {
    const issues: string[] = [];

    if (config.CORS_ORIGINS.includes('*') && config.NODE_ENV === 'production') {
      issues.push('CORS origins should not be "*" in production');
    }

    if (config.CORS_ORIGINS.length === 0) {
      issues.push('No CORS origins configured');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'CORS is properly configured' : `CORS issues found: ${issues.join(', ')}`,
      details: { issues, configuredOrigins: config.CORS_ORIGINS },
    };
  }

  private async checkRateLimiting() {
    const issues: string[] = [];

    if (!config.ENABLE_RATE_LIMITING) {
      issues.push('Rate limiting is disabled');
    }

    if (config.API_RATE_LIMIT_MAX > 1000) {
      issues.push('Rate limit is very high, consider reducing it');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Rate limiting is properly configured' : `Rate limiting issues: ${issues.join(', ')}`,
      details: { 
        issues, 
        enabled: config.ENABLE_RATE_LIMITING,
        maxRequests: config.API_RATE_LIMIT_MAX,
        windowMs: config.API_RATE_LIMIT_WINDOW_MS,
      },
    };
  }

  private async checkDatabaseSecurity() {
    const issues: string[] = [];

    // Check if database URL contains SSL parameters
    if (!config.DATABASE_URL.includes('sslmode=')) {
      issues.push('Database connection should enforce SSL');
    }

    // Check for potential SQL injection risks
    try {
      const grepResult = execSync('grep -r "SELECT\\|INSERT\\|UPDATE\\|DELETE" src/ --include="*.ts" --include="*.tsx" | grep -v "prisma\\|\\$queryRaw" || true', { encoding: 'utf8' });
      if (grepResult.length > 0) {
        issues.push('Potential raw SQL queries found - use Prisma client instead');
      }
    } catch (error) {
      // No raw SQL found
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Database security is properly configured' : `Database security issues: ${issues.join(', ')}`,
      details: { issues },
    };
  }

  private async checkJWTConfiguration() {
    const issues: string[] = [];

    if (config.JWT_SECRET.length < 32) {
      issues.push('JWT secret should be at least 32 characters');
    }

    if (config.JWT_EXPIRES_IN && parseInt(config.JWT_EXPIRES_IN) > 86400 * 30) {
      issues.push('JWT expiration time is very long (> 30 days)');
    }

    // Check if JWT secret is commonly used
    const commonSecrets = ['secret', 'password', '123456', 'changeme'];
    if (commonSecrets.some(secret => config.JWT_SECRET.toLowerCase().includes(secret))) {
      issues.push('JWT secret appears to be commonly used or weak');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'JWT configuration is secure' : `JWT security issues: ${issues.join(', ')}`,
      details: { 
        issues, 
        expiresIn: config.JWT_EXPIRES_IN,
        secretLength: config.JWT_SECRET.length,
      },
    };
  }

  private async checkPasswordSecurity() {
    const issues: string[] = [];

    if (parseInt(config.BCRYPT_ROUNDS) < 12) {
      issues.push('BCrypt rounds should be at least 12 for strong password hashing');
    }

    // Check for password validation in auth code
    const authFiles = ['src/auth/', 'src/app/api/auth/'];
    for (const authFile of authFiles) {
      if (existsSync(authFile)) {
        try {
          const grepResult = execSync(`grep -r "password.*length\\|password.*regex" ${authFile} || true`, { encoding: 'utf8' });
          if (grepResult.length === 0) {
            issues.push('No password validation rules found in auth code');
          }
        } catch (error) {
          issues.push('Unable to verify password validation rules');
        }
      }
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Password security is properly configured' : `Password security issues: ${issues.join(', ')}`,
      details: { issues, bcryptRounds: config.BCRYPT_ROUNDS },
    };
  }

  private async checkDependencyVulnerabilities() {
    const issues: string[] = [];

    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
        const vulnCount = Object.keys(audit.vulnerabilities).length;
        const criticalVulns = Object.values(audit.vulnerabilities).filter((v: any) => v.severity === 'critical').length;
        const highVulns = Object.values(audit.vulnerabilities).filter((v: any) => v.severity === 'high').length;
        
        if (criticalVulns > 0) {
          issues.push(`${criticalVulns} critical vulnerabilities found`);
        }
        if (highVulns > 0) {
          issues.push(`${highVulns} high severity vulnerabilities found`);
        }
        
        if (vulnCount > 0) {
          issues.push(`${vulnCount} total vulnerabilities found`);
        }
      }
    } catch (error) {
      issues.push('Unable to run npm audit');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'No critical vulnerabilities found' : `Vulnerabilities found: ${issues.join(', ')}`,
      details: { issues },
    };
  }

  private async checkFileUploadSecurity() {
    const issues: string[] = [];

    if (config.MAX_FILE_SIZE > 50 * 1024 * 1024) { // 50MB
      issues.push('Maximum file size is very large (> 50MB)');
    }

    const dangerousTypes = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const allowedTypes = config.ALLOWED_FILE_TYPES;
    
    for (const dangerousType of dangerousTypes) {
      if (allowedTypes.some(type => type.includes(dangerousType))) {
        issues.push(`Dangerous file type allowed: ${dangerousType}`);
      }
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'File upload security is properly configured' : `File upload issues: ${issues.join(', ')}`,
      details: { 
        issues, 
        maxSize: config.MAX_FILE_SIZE,
        allowedTypes: config.ALLOWED_FILE_TYPES,
      },
    };
  }

  private async checkSessionSecurity() {
    const issues: string[] = [];

    if (config.SESSION_MAX_AGE > 86400 * 7) { // 7 days
      issues.push('Session max age is very long (> 7 days)');
    }

    // Check for secure cookie settings in production
    if (config.NODE_ENV === 'production') {
      // This would require checking actual middleware or cookie configuration
      // For now, just warn about it
      issues.push('Verify secure cookie settings in production (httpOnly, secure, sameSite)');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Session security is properly configured' : `Session security issues: ${issues.join(', ')}`,
      details: { issues, maxAge: config.SESSION_MAX_AGE },
    };
  }

  private async checkHTTPSConfiguration() {
    const issues: string[] = [];

    if (config.NODE_ENV === 'production') {
      // In production, HTTPS should be enforced
      // This is a simplified check - in reality you'd check your deployment config
      issues.push('Verify HTTPS is enforced in production (check reverse proxy/deployment config)');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'HTTPS configuration is secure' : `HTTPS issues: ${issues.join(', ')}`,
      details: { issues, environment: config.NODE_ENV },
    };
  }

  private async checkInputValidation() {
    const issues: string[] = [];

    // Check for input validation in API routes
    try {
      const apiFiles = execSync('find src/app/api -name "*.ts" | head -5', { encoding: 'utf8' }).trim().split('\n');
      
      for (const file of apiFiles) {
        if (file && existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          if (!content.includes('zod') && !content.includes('validation') && !content.includes('schema')) {
            issues.push(`No input validation found in ${file}`);
          }
        }
      }
    } catch (error) {
      issues.push('Unable to verify input validation in API routes');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Input validation is properly implemented' : `Input validation issues: ${issues.join(', ')}`,
      details: { issues },
    };
  }

  private async checkErrorHandling() {
    const issues: string[] = [];

    // Check for detailed error messages in production
    try {
      const grepResult = execSync('grep -r "console.error\\|console.log" src/app/api/ --include="*.ts" || true', { encoding: 'utf8' });
      if (grepResult.length > 0) {
        issues.push('Console logs found in API routes - may leak sensitive information');
      }
    } catch (error) {
      // No console logs found
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Error handling is secure' : `Error handling issues: ${issues.join(', ')}`,
      details: { issues },
    };
  }

  private async checkLoggingSecurity() {
    const issues: string[] = [];

    // Check if sensitive data might be logged
    try {
      const grepResult = execSync('grep -r "password\\|secret\\|token" src/lib/logger.ts || true', { encoding: 'utf8' });
      if (grepResult.length > 0) {
        issues.push('Potentially logging sensitive data - review logger implementation');
      }
    } catch (error) {
      // No sensitive data in logger
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Logging is secure' : `Logging security issues: ${issues.join(', ')}`,
      details: { issues },
    };
  }

  async runAudit() {
    logger.info('Starting security audit...');
    
    console.log('\n🔒 Auth-Spine Security Audit');
    console.log('================================\n');

    for (const check of this.checks) {
      try {
        console.log(`📋 ${check.name} (${check.severity.toUpperCase()})`);
        console.log(`   ${check.description}`);
        
        const result = await check.check();
        this.results.push({ check, result });
        
        if (result.passed) {
          console.log(`   ✅ ${result.message}`);
        } else {
          console.log(`   ❌ ${result.message}`);
          if (result.details?.issues) {
            result.details.issues.forEach((issue: string) => {
              console.log(`      • ${issue}`);
            });
          }
        }
        console.log('');
      } catch (error) {
        console.log(`   💥 Check failed: ${error}`);
        this.results.push({
          check,
          result: { passed: false, message: `Check failed: ${error}` },
        });
        console.log('');
      }
    }

    this.printSummary();
    return this.generateReport();
  }

  private printSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.result.passed).length;
    const failed = total - passed;
    
    const critical = this.results.filter(r => !r.result.passed && r.check.severity === 'critical').length;
    const high = this.results.filter(r => !r.result.passed && r.check.severity === 'high').length;
    const medium = this.results.filter(r => !r.result.passed && r.check.severity === 'medium').length;
    const low = this.results.filter(r => !r.result.passed && r.check.severity === 'low').length;

    console.log('📊 Security Audit Summary');
    console.log('========================');
    console.log(`Total checks: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌\n`);
    
    if (failed > 0) {
      console.log('🚨 Failed Checks by Severity:');
      if (critical > 0) console.log(`   Critical: ${critical} 🔴`);
      if (high > 0) console.log(`   High: ${high} 🟠`);
      if (medium > 0) console.log(`   Medium: ${medium} 🟡`);
      if (low > 0) console.log(`   Low: ${low} 🟢`);
      console.log('');
    }

    const overallScore = Math.round((passed / total) * 100);
    console.log(`🎯 Overall Security Score: ${overallScore}%`);
    
    if (overallScore >= 90) {
      console.log('🏆 Excellent security posture!');
    } else if (overallScore >= 70) {
      console.log('👍 Good security posture with room for improvement');
    } else if (overallScore >= 50) {
      console.log('⚠️  Moderate security risks - address high-priority issues');
    } else {
      console.log('🚨 Critical security issues - immediate attention required');
    }
  }

  private generateReport() {
    return {
      timestamp: new Date().toISOString(),
      totalChecks: this.results.length,
      passed: this.results.filter(r => r.result.passed).length,
      failed: this.results.filter(r => !r.result.passed).length,
      score: Math.round((this.results.filter(r => r.result.passed).length / this.results.length) * 100),
      results: this.results.map(r => ({
        name: r.check.name,
        severity: r.check.severity,
        passed: r.result.passed,
        message: r.result.message,
        details: r.result.details,
      })),
    };
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runAudit()
    .then((report) => {
      logger.info('Security audit completed', { score: report.score, failed: report.failed });
      process.exit(report.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      logger.error('Security audit failed', error);
      process.exit(1);
    });
}

export default SecurityAuditor;
