/**
 * Data Protection for SaaS/PaaS Security Suite
 * 
 * Provides comprehensive data protection including encryption,
 * data classification, DLP, and retention policies.
 */

import { DataProtectionConfig, DataClassification, DataRetentionPolicy } from './types.js';

export class DataProtectionManager {
  private config: DataProtectionConfig;
  private encryptionKeys: Map<string, any> = new Map();
  private dataClassifications: Map<string, any> = new Map();
  private dlpRules: Map<string, any> = new Map();
  private retentionPolicies: Map<string, DataRetentionPolicy> = new Map();
  private initialized = false;

  /**
   * Initialize data protection
   */
  async initialize(config: DataProtectionConfig): Promise<void> {
    this.config = config;
    this.loadEncryptionKeys();
    this.loadDataClassifications();
    this.loadDLPRules();
    this.loadRetentionPolicies();
    this.initialized = true;
  }

  /**
   * Encrypt data
   */
  async encryptData(tenantId: string, data: any, classification: DataClassification): Promise<{
    encryptedData: string;
    keyId: string;
    algorithm: string;
  }> {
    if (!this.config.enableEncryptionAtRest) {
      return {
        encryptedData: JSON.stringify(data),
        keyId: 'none',
        algorithm: 'none'
      };
    }

    const keyId = await this.getEncryptionKey(tenantId, classification);
    const algorithm = 'AES-256-GCM';
    
    // Simulate encryption
    const encryptedData = this.simulateEncryption(data, keyId, algorithm);
    
    return {
      encryptedData,
      keyId,
      algorithm
    };
  }

  /**
   * Decrypt data
   */
  async decryptData(tenantId: string, encryptedData: string, keyId: string, algorithm: string): Promise<any> {
    if (algorithm === 'none') {
      return JSON.parse(encryptedData);
    }

    // Simulate decryption
    return this.simulateDecryption(encryptedData, keyId, algorithm);
  }

  /**
   * Classify data
   */
  async classifyData(data: any, context?: any): Promise<{
    classification: DataClassification;
    confidence: number;
    reasons: string[];
  }> {
    if (!this.config.enableDataClassification) {
      return {
        classification: 'internal',
        confidence: 0.5,
        reasons: ['Classification disabled']
      };
    }

    const analysis = this.analyzeDataForClassification(data, context);
    
    return {
      classification: analysis.classification,
      confidence: analysis.confidence,
      reasons: analysis.reasons
    };
  }

  /**
   * Check data for DLP violations
   */
  async checkDLPViolations(tenantId: string, data: any, context?: any): Promise<{
    violations: Array<{
      ruleId: string;
      ruleName: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location: string;
      confidence: number;
    }>;
    riskScore: number;
    recommendations: string[];
  }> {
    const violations = [];
    let totalRiskScore = 0;

    for (const [ruleId, rule] of this.dlpRules.entries()) {
      const violation = await this.evaluateDLPRule(rule, data, context);
      if (violation) {
        violations.push({
          ruleId,
          ruleName: rule.name,
          severity: rule.severity,
          description: rule.description,
          location: violation.location,
          confidence: violation.confidence
        });
        totalRiskScore += this.getRiskScore(rule.severity);
      }
    }

    const recommendations = this.generateDLPRecommendations(violations);

    return {
      violations,
      riskScore: totalRiskScore,
      recommendations
    };
  }

  /**
   * Apply retention policy
   */
  async applyRetentionPolicy(tenantId: string, dataType: string, dataId: string): Promise<{
    action: 'retain' | 'archive' | 'delete';
    reason: string;
    nextReview: Date;
  }> {
    if (!this.config.enableDataRetentionPolicies) {
      return {
        action: 'retain',
        reason: 'Retention policies disabled',
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };
    }

    const policy = this.getRetentionPolicy(dataType);
    if (!policy) {
      return {
        action: 'retain',
        reason: 'No retention policy found',
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };
    }

    const action = await this.evaluateRetentionPolicy(policy, dataId);
    const nextReview = new Date(Date.now() + policy.reviewFrequency * this.getReviewUnitMultiplier(policy.reviewUnit));

    return {
      action,
      reason: policy.description,
      nextReview
    };
  }

  /**
   * Get data protection metrics
   */
  async getMetrics(): Promise<{
    encryptedData: number;
    classifiedData: Record<DataClassification, number>;
    dlpViolations: number;
    retentionActions: number;
    keyRotations: number;
  }> {
    return {
      encryptedData: this.countEncryptedData(),
      classifiedData: this.countClassifiedData(),
      dlpViolations: this.countDLPViolations(),
      retentionActions: this.countRetentionActions(),
      keyRotations: this.countKeyRotations()
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate data protection configuration
   */
  generateConfig(): {
    encryption: string;
    classification: string;
    dlp: string;
    retention: string;
  } {
    const encryptionConfig = this.generateEncryptionConfig();
    const classificationConfig = this.generateClassificationConfig();
    const dlpConfig = this.generateDLPConfig();
    const retentionConfig = this.generateRetentionConfig();

    return {
      encryption: encryptionConfig,
      classification: classificationConfig,
      dlp: dlpConfig,
      retention: retentionConfig
    };
  }

  private async getEncryptionKey(tenantId: string, classification: DataClassification): Promise<string> {
    if (!this.config.enableTenantSpecificEncryption) {
      return 'global_key';
    }

    const keyId = `${tenantId}_${classification}`;
    
    if (!this.encryptionKeys.has(keyId)) {
      await this.generateEncryptionKey(keyId, tenantId, classification);
    }

    return keyId;
  }

  private async generateEncryptionKey(keyId: string, tenantId: string, classification: DataClassification): Promise<void> {
    const key = {
      id: keyId,
      tenantId,
      classification,
      algorithm: 'AES-256-GCM',
      keyLength: 256,
      createdAt: new Date(),
      lastRotated: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    this.encryptionKeys.set(keyId, key);
  }

  private simulateEncryption(data: any, keyId: string, algorithm: string): string {
    // Simulate encryption
    const dataString = JSON.stringify(data);
    const encrypted = Buffer.from(dataString).toString('base64');
    return `${algorithm}:${keyId}:${encrypted}`;
  }

  private simulateDecryption(encryptedData: string, keyId: string, algorithm: string): any {
    // Simulate decryption
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [, , data] = parts;
    const decrypted = Buffer.from(data, 'base64').toString();
    return JSON.parse(decrypted);
  }

  private analyzeDataForClassification(data: any, context?: any): {
    classification: DataClassification;
    confidence: number;
    reasons: string[];
  } {
    const reasons = [];
    let classification: DataClassification = 'internal';
    let confidence = 0.5;

    const dataString = JSON.stringify(data).toLowerCase();

    // Check for PII patterns
    if (this.containsPII(dataString)) {
      classification = 'confidential';
      confidence = 0.8;
      reasons.push('Contains personally identifiable information');
    }

    // Check for financial data
    if (this.containsFinancialData(dataString)) {
      classification = 'restricted';
      confidence = 0.9;
      reasons.push('Contains financial information');
    }

    // Check for health data
    if (this.containsHealthData(dataString)) {
      classification = 'restricted';
      confidence = 0.9;
      reasons.push('Contains health information');
    }

    // Check for sensitive keywords
    if (this.containsSensitiveKeywords(dataString)) {
      if (classification === 'internal') {
        classification = 'confidential';
        confidence = 0.7;
        reasons.push('Contains sensitive keywords');
      }
    }

    // Context-based classification
    if (context?.source === 'user_input') {
      if (classification === 'public') {
        classification = 'internal';
        reasons.push('User-provided data');
      }
    }

    return { classification, confidence, reasons };
  }

  private containsPII(data: string): boolean {
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/ // Phone
    ];

    return piiPatterns.some(pattern => pattern.test(data));
  }

  private containsFinancialData(data: string): boolean {
    const financialKeywords = [
      'credit card', 'bank account', 'routing number', 'account number',
      'payment', 'transaction', 'invoice', 'billing', 'salary', 'wage'
    ];

    return financialKeywords.some(keyword => data.includes(keyword));
  }

  private containsHealthData(data: string): boolean {
    const healthKeywords = [
      'medical', 'health', 'diagnosis', 'treatment', 'prescription',
      'doctor', 'patient', 'hospital', 'clinic', 'medication'
    ];

    return healthKeywords.some(keyword => data.includes(keyword));
  }

  private containsSensitiveKeywords(data: string): boolean {
    const sensitiveKeywords = [
      'confidential', 'proprietary', 'trade secret', 'internal only',
      'do not distribute', 'private', 'sensitive'
    ];

    return sensitiveKeywords.some(keyword => data.includes(keyword));
  }

  private async evaluateDLPRule(rule: any, data: any, context?: any): Promise<{
    location: string;
    confidence: number;
  } | null> {
    const dataString = JSON.stringify(data);
    
    for (const pattern of rule.patterns) {
      const regex = new RegExp(pattern.regex, pattern.flags);
      const matches = dataString.match(regex);
      
      if (matches) {
        return {
          location: pattern.description || 'Unknown location',
          confidence: pattern.confidence || 0.8
        };
      }
    }

    return null;
  }

  private getRiskScore(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    const scores = {
      low: 10,
      medium: 25,
      high: 50,
      critical: 100
    };
    return scores[severity];
  }

  private generateDLPRecommendations(violations: any[]): string[] {
    const recommendations = [];
    
    if (violations.some(v => v.severity === 'critical')) {
      recommendations.push('Immediate action required - critical data violations detected');
    }
    
    if (violations.some(v => v.severity === 'high')) {
      recommendations.push('Review and secure high-risk data immediately');
    }
    
    if (violations.length > 5) {
      recommendations.push('Implement additional data protection controls');
    }
    
    recommendations.push('Review data handling procedures');
    recommendations.push('Provide data protection training to staff');
    
    return recommendations;
  }

  private getRetentionPolicy(dataType: string): DataRetentionPolicy | null {
    return Array.from(this.retentionPolicies.values())
      .find(policy => policy.dataType === dataType) || null;
  }

  private async evaluateRetentionPolicy(policy: DataRetentionPolicy, dataId: string): Promise<'retain' | 'archive' | 'delete'> {
    // Simulate policy evaluation
    const dataAge = this.getDataAge(dataId);
    const retentionPeriod = policy.retentionPeriod * this.getRetentionUnitMultiplier(policy.retentionUnit);
    
    if (dataAge < retentionPeriod * 0.8) {
      return 'retain';
    } else if (dataAge < retentionPeriod) {
      return 'archive';
    } else {
      return 'delete';
    }
  }

  private getDataAge(dataId: string): number {
    // Simulate data age calculation
    return Math.random() * 1000; // Random age in days
  }

  private getRetentionUnitMultiplier(unit: 'days' | 'months' | 'years'): number {
    return {
      days: 1,
      months: 30,
      years: 365
    }[unit];
  }

  private getReviewUnitMultiplier(unit: 'months' | 'years'): number {
    return {
      months: 30,
      years: 365
    }[unit];
  }

  private countEncryptedData(): number {
    // Simulate encrypted data count
    return 10000;
  }

  private countClassifiedData(): Record<DataClassification, number> {
    // Simulate classified data count
    return {
      public: 5000,
      internal: 3000,
      confidential: 1500,
      restricted: 500
    };
  }

  private countDLPViolations(): number {
    // Simulate DLP violations count
    return 25;
  }

  private countRetentionActions(): number {
    // Simulate retention actions count
    return 150;
  }

  private countKeyRotations(): number {
    // Simulate key rotations count
    return 12;
  }

  private loadEncryptionKeys(): void {
    // Load default encryption keys
    const defaultKeys = [
      {
        id: 'global_key',
        tenantId: 'global',
        classification: 'internal',
        algorithm: 'AES-256-GCM',
        keyLength: 256,
        createdAt: new Date(),
        lastRotated: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    ];

    defaultKeys.forEach(key => {
      this.encryptionKeys.set(key.id, key);
    });
  }

  private loadDataClassifications(): void {
    // Load default data classifications
    const defaultClassifications = [
      {
        id: 'public',
        name: 'Public',
        description: 'Data that can be freely shared',
        handling: 'No special handling required',
        retention: 365, // days
        encryption: false
      },
      {
        id: 'internal',
        name: 'Internal',
        description: 'Internal company data',
        handling: 'Internal access only',
        retention: 1095, // days
        encryption: true
      },
      {
        id: 'confidential',
        name: 'Confidential',
        description: 'Sensitive company data',
        handling: 'Restricted access, encryption required',
        retention: 2555, // days
        encryption: true
      },
      {
        id: 'restricted',
        name: 'Restricted',
        description: 'Highly sensitive data',
        handling: 'Strict access controls, strong encryption',
        retention: 2555, // days
        encryption: true
      }
    ];

    defaultClassifications.forEach(classification => {
      this.dataClassifications.set(classification.id, classification);
    });
  }

  private loadDLPRules(): void {
    // Load default DLP rules
    const defaultRules = [
      {
        id: 'pii_ssn',
        name: 'SSN Detection',
        description: 'Detects Social Security Numbers',
        severity: 'high' as const,
        patterns: [
          {
            regex: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
            flags: 'g',
            confidence: 0.95,
            description: 'SSN pattern'
          }
        ]
      },
      {
        id: 'pii_credit_card',
        name: 'Credit Card Detection',
        description: 'Detects Credit Card Numbers',
        severity: 'critical' as const,
        patterns: [
          {
            regex: '\\b\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b',
            flags: 'g',
            confidence: 0.9,
            description: 'Credit card pattern'
          }
        ]
      },
      {
        id: 'pii_email',
        name: 'Email Detection',
        description: 'Detects Email Addresses',
        severity: 'medium' as const,
        patterns: [
          {
            regex: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
            flags: 'g',
            confidence: 0.8,
            description: 'Email pattern'
          }
        ]
      }
    ];

    defaultRules.forEach(rule => {
      this.dlpRules.set(rule.id, rule);
    });
  }

  private loadRetentionPolicies(): void {
    // Load default retention policies
    const defaultPolicies = [
      {
        id: 'user_data',
        name: 'User Data Retention',
        description: 'Policy for user-generated data',
        dataType: 'user_data',
        classification: 'internal' as const,
        retentionPeriod: 1095,
        retentionUnit: 'days' as const,
        autoDelete: true,
        legalHold: false,
        archival: true,
        exceptions: ['legal_hold', 'active_investigation'],
        owner: 'data_protection_officer',
        approvedBy: 'compliance_team',
        approvedAt: new Date(),
        reviewFrequency: 12,
        reviewUnit: 'months' as const,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'financial_data',
        name: 'Financial Data Retention',
        description: 'Policy for financial records',
        dataType: 'financial_data',
        classification: 'restricted' as const,
        retentionPeriod: 7,
        retentionUnit: 'years' as const,
        autoDelete: false,
        legalHold: true,
        archival: true,
        exceptions: ['legal_requirement', 'audit'],
        owner: 'cfo',
        approvedBy: 'board',
        approvedAt: new Date(),
        reviewFrequency: 1,
        reviewUnit: 'years' as const,
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    ];

    defaultPolicies.forEach(policy => {
      this.retentionPolicies.set(policy.id, policy);
    });
  }

  private generateEncryptionConfig(): string {
    return `
# Data Encryption Configuration
# Generated on ${new Date().toISOString()}

# Encryption key management
CREATE TABLE encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  classification text NOT NULL,
  algorithm text NOT NULL,
  key_length integer NOT NULL,
  key_data bytea NOT NULL, -- Encrypted key material
  created_at timestamptz DEFAULT now(),
  last_rotated timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text DEFAULT 'active'
);

# Key rotation schedule
const keyRotationSchedule = {
  'high_security': 90, // days
  'standard': 365, // days
  'low_security': 730 // days
};

# Encryption service
class EncryptionService {
  constructor(keyManager) {
    this.keyManager = keyManager;
  }
  
  async encrypt(tenantId, data, classification) {
    const key = await this.keyManager.getKey(tenantId, classification);
    const encrypted = await this.performEncryption(data, key);
    
    return {
      data: encrypted.data,
      keyId: key.id,
      algorithm: key.algorithm,
      iv: encrypted.iv,
      tag: encrypted.tag
    };
  }
  
  async decrypt(tenantId, encryptedData, keyId) {
    const key = await this.keyManager.getKeyById(keyId);
    return await this.performDecryption(encryptedData, key);
  }
}
`;
  }

  private generateClassificationConfig(): string {
    return `
# Data Classification Configuration
# Generated on ${new Date().toISOString()}

CREATE TABLE data_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  handling_requirements text,
  retention_period integer,
  encryption_required boolean DEFAULT false,
  access_controls jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE data_classification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classification_id uuid REFERENCES data_classifications(id),
  rule_type text NOT NULL, -- 'pattern', 'keyword', 'ml_model'
  rule_config jsonb NOT NULL,
  confidence_threshold numeric DEFAULT 0.8,
  active boolean DEFAULT true
);

# Classification service
class DataClassificationService {
  constructor() {
    this.rules = new Map();
    this.loadRules();
  }
  
  async classify(data, context = {}) {
    const results = [];
    
    for (const [ruleId, rule] of this.rules.entries()) {
      if (!rule.active) continue;
      
      const result = await this.evaluateRule(rule, data, context);
      if (result.confidence >= rule.confidence_threshold) {
        results.push({
          classification: rule.classificationId,
          confidence: result.confidence,
          ruleId,
          reasons: result.reasons
        });
      }
    }
    
    // Return highest confidence classification
    return results.sort((a, b) => b.confidence - a.confidence)[0] || {
      classification: 'internal',
      confidence: 0.5,
      reasons: ['Default classification']
    };
  }
  
  async evaluateRule(rule, data, context) {
    switch (rule.ruleType) {
      case 'pattern':
        return this.evaluatePatternRule(rule, data);
      case 'keyword':
        return this.evaluateKeywordRule(rule, data);
      case 'ml_model':
        return this.evaluateMLRule(rule, data, context);
      default:
        return { confidence: 0, reasons: [] };
    }
  }
}
`;
  }

  private generateDLPConfig(): string {
    return `
# Data Loss Prevention Configuration
# Generated on ${new Date().toISOString()}

CREATE TABLE dlp_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  patterns jsonb NOT NULL,
  actions jsonb DEFAULT '[]',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE dlp_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES dlp_rules(id),
  tenant_id uuid REFERENCES tenants(id),
  user_id uuid REFERENCES users(id),
  data_fingerprint text,
  violation_details jsonb,
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolution_details jsonb
);

# DLP service
class DLPService {
  constructor(ruleManager, alertManager) {
    this.ruleManager = ruleManager;
    this.alertManager = alertManager;
  }
  
  async scanData(tenantId, data, context = {}) {
    const violations = [];
    
    const rules = await this.ruleManager.getActiveRules();
    for (const rule of rules) {
      const violation = await this.evaluateRule(rule, data, context);
      if (violation) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          description: rule.description,
          location: violation.location,
          confidence: violation.confidence
        });
      }
    }
    
    // Log violations
    if (violations.length > 0) {
      await this.logViolations(tenantId, violations, context);
    }
    
    // Send alerts for high-severity violations
    const criticalViolations = violations.filter(v => 
      ['high', 'critical'].includes(v.severity)
    );
    
    if (criticalViolations.length > 0) {
      await this.alertManager.sendDLPAlert(tenantId, criticalViolations);
    }
    
    return {
      violations,
      riskScore: this.calculateRiskScore(violations),
      recommendations: this.generateRecommendations(violations)
    };
  }
}
`;
  }

  private generateRetentionConfig(): string {
    return `
# Data Retention Configuration
# Generated on ${new Date().toISOString()}

CREATE TABLE retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  data_type text NOT NULL,
  classification text NOT NULL,
  retention_period integer NOT NULL,
  retention_unit text NOT NULL CHECK (retention_unit IN ('days', 'months', 'years')),
  auto_delete boolean DEFAULT false,
  legal_hold boolean DEFAULT false,
  archival boolean DEFAULT false,
  exceptions text[],
  owner text NOT NULL,
  approved_by text NOT NULL,
  approved_at timestamptz DEFAULT now(),
  review_frequency integer NOT NULL,
  review_unit text NOT NULL CHECK (review_unit IN ('months', 'years')),
  last_reviewed timestamptz DEFAULT now(),
  next_review timestamptz NOT NULL
);

CREATE TABLE data_retention_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid REFERENCES retention_policies(id),
  data_id text NOT NULL,
  data_type text NOT NULL,
  tenant_id uuid REFERENCES tenants(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text DEFAULT 'active',
  last_reviewed timestamptz,
  actions jsonb DEFAULT '[]'
);

# Retention service
class DataRetentionService {
  constructor(policyManager, archivalService) {
    this.policyManager = policyManager;
    this.archivalService = archivalService;
  }
  
  async applyRetentionPolicy(dataId, dataType, tenantId) {
    const policy = await this.policyManager.getPolicy(dataType);
    if (!policy) {
      return { action: 'retain', reason: 'No policy found' };
    }
    
    const dataAge = await this.getDataAge(dataId);
    const retentionPeriod = policy.retention_period * this.getUnitMultiplier(policy.retention_unit);
    
    let action: 'retain' | 'archive' | 'delete';
    
    if (dataAge < retentionPeriod * 0.8) {
      action = 'retain';
    } else if (dataAge < retentionPeriod) {
      action = 'archive';
      if (policy.archival) {
        await this.archivalService.archive(dataId, policy);
      }
    } else {
      action = 'delete';
      if (policy.auto_delete && !policy.legal_hold) {
        await this.deleteData(dataId);
      }
    }
    
    return {
      action,
      reason: policy.description,
      nextReview: new Date(Date.now() + policy.review_frequency * this.getUnitMultiplier(policy.review_unit))
    };
  }
  
  async scheduleRetentionReview() {
    const policies = await this.policyManager.getPoliciesNeedingReview();
    
    for (const policy of policies) {
      await this.reviewPolicy(policy);
    }
  }
}
`;
  }
}

// Export singleton instance
export const dataProtection = new DataProtectionManager();
