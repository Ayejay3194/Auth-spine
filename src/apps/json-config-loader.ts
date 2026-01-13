import securityAuditFinal from '@/docs/security/FINAL_CONSOLIDATED_SECURITY_AUDIT.json'
import securityAuditPass from '@/examples/security-audit.pass.json'
import securityAuditWarn from '@/examples/security-audit.warn.json'
import securityAuditFail from '@/examples/security-audit.fail.json'

export interface SecurityAuditConfig {
  findings: Array<{
    id: string
    title: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    remediation?: string
  }>
  recommendations: string[]
  compliance: {
    score: number
    status: string
    standards: string[]
  }
}

export interface SecurityAuditExample {
  status: 'pass' | 'warn' | 'fail'
  checks: Array<{
    name: string
    result: boolean
    message?: string
  }>
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
}

export class JSONConfigLoader {
  private static instance: JSONConfigLoader
  private configs: Map<string, any> = new Map()

  private constructor() {
    this.loadConfigs()
  }

  static getInstance(): JSONConfigLoader {
    if (!JSONConfigLoader.instance) {
      JSONConfigLoader.instance = new JSONConfigLoader()
    }
    return JSONConfigLoader.instance
  }

  private loadConfigs() {
    // Load security audit configurations
    this.configs.set('security-audit-final', securityAuditFinal)
    this.configs.set('security-audit-pass', securityAuditPass)
    this.configs.set('security-audit-warn', securityAuditWarn)
    this.configs.set('security-audit-fail', securityAuditFail)
  }

  getSecurityAuditFinal(): SecurityAuditConfig {
    return this.configs.get('security-audit-final') as SecurityAuditConfig
  }

  getSecurityAuditPass(): SecurityAuditExample {
    return this.configs.get('security-audit-pass') as SecurityAuditExample
  }

  getSecurityAuditWarn(): SecurityAuditExample {
    return this.configs.get('security-audit-warn') as SecurityAuditExample
  }

  getSecurityAuditFail(): SecurityAuditExample {
    return this.configs.get('security-audit-fail') as SecurityAuditExample
  }

  getAllSecurityAudits() {
    return {
      final: this.getSecurityAuditFinal(),
      pass: this.getSecurityAuditPass(),
      warn: this.getSecurityAuditWarn(),
      fail: this.getSecurityAuditFail()
    }
  }

  getConfig(key: string): any {
    return this.configs.get(key)
  }

  getAllConfigs(): Record<string, any> {
    const result: Record<string, any> = {}
    this.configs.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  // Get compliance score from security audit
  getComplianceScore(): number {
    const audit = this.getSecurityAuditFinal()
    return audit.compliance?.score || 0
  }

  // Get security findings
  getSecurityFindings() {
    const audit = this.getSecurityAuditFinal()
    return audit.findings || []
  }

  // Get security recommendations
  getSecurityRecommendations(): string[] {
    const audit = this.getSecurityAuditFinal()
    return audit.recommendations || []
  }

  // Get compliance standards
  getComplianceStandards(): string[] {
    const audit = this.getSecurityAuditFinal()
    return audit.compliance?.standards || []
  }

  // Check if system passes security audit
  passesSecurityAudit(): boolean {
    const example = this.getSecurityAuditPass()
    return example.summary.failed === 0
  }

  // Get security audit summary
  getSecuritySummary() {
    const final = this.getSecurityAuditFinal()
    const pass = this.getSecurityAuditPass()
    const warn = this.getSecurityAuditWarn()
    const fail = this.getSecurityAuditFail()

    return {
      complianceScore: final.compliance?.score || 0,
      complianceStatus: final.compliance?.status || 'unknown',
      findingsCount: final.findings?.length || 0,
      recommendationsCount: final.recommendations?.length || 0,
      passedChecks: pass.summary.passed,
      failedChecks: fail.summary.failed,
      warningChecks: warn.summary.warnings,
      standards: final.compliance?.standards || []
    }
  }
}

// Export singleton instance
export const configLoader = JSONConfigLoader.getInstance()
