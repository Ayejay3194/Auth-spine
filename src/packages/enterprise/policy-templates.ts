/**
 * Policy Templates for Legal & Compliance Disaster Kit
 * 
 * Provides templates for privacy policy, terms of service, DPA,
 * cookie policy, retention policy, AUP, accessibility, and security.
 */

import { CompliancePolicy, ComplianceFramework } from './types.js';

export interface PolicyTemplate {
  id: string;
  name: string;
  type: CompliancePolicy['type'];
  framework: ComplianceFramework[];
  content: string;
  variables: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

export class PolicyTemplateManager {
  private templates: Map<string, PolicyTemplate> = new Map();
  private policies: Map<string, CompliancePolicy> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  /**
   * Initialize policy template manager
   */
  async initialize(): Promise<void> {
    // Load templates from storage if needed
  }

  /**
   * Create policy from template
   */
  createFromTemplate(templateId: string, name: string, variables: Record<string, string> = {}): CompliancePolicy {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Replace variables in template content
    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const policy: CompliancePolicy = {
      id: `policy_${Date.now()}`,
      name,
      type: template.type,
      framework: template.framework,
      status: 'draft',
      content,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.policies.set(policy.id, policy);
    return policy;
  }

  /**
   * Add policy
   */
  addPolicy(policy: CompliancePolicy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Get policy by ID
   */
  getPolicy(id: string): CompliancePolicy | undefined {
    return this.policies.get(id);
  }

  /**
   * Get all policies
   */
  getAllPolicies(): CompliancePolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Update policy status
   */
  updateStatus(id: string, status: CompliancePolicy['status'], approvedBy?: string): void {
    const policy = this.policies.get(id);
    if (!policy) return;

    policy.status = status;
    policy.updatedAt = new Date();
    
    if (status === 'approved' && approvedBy) {
      policy.approvedBy = approvedBy;
      policy.approvedAt = new Date();
    }
  }

  /**
   * Get available templates
   */
  getTemplates(): PolicyTemplate[] {
    return Array.from(this.templates.values());
  }

  private loadDefaultTemplates(): void {
    // Privacy Policy Template
    this.templates.set('privacy-policy', {
      id: 'privacy-policy',
      name: 'Privacy Policy',
      type: 'privacy',
      framework: ['GDPR', 'CCPA'],
      content: `# Privacy Policy

**Last Updated:** {{date}}

**Company:** {{companyName}}

## Information We Collect

We collect information you provide directly to us, such as when you create an account, use our services, or contact us.

## How We Use Your Information

We use the information we collect to provide, maintain, and improve our services.

## Your Rights

You have the right to access, update, or delete your personal information.

## Contact Us

If you have questions about this Privacy Policy, contact us at {{contactEmail}}.`,
      variables: [
        { name: 'date', description: 'Last updated date', required: true },
        { name: 'companyName', description: 'Company name', required: true },
        { name: 'contactEmail', description: 'Contact email', required: true }
      ]
    });

    // Terms of Service Template
    this.templates.set('terms-of-service', {
      id: 'terms-of-service',
      name: 'Terms of Service',
      type: 'terms',
      framework: ['GDPR'],
      content: `# Terms of Service

**Last Updated:** {{date}}

**Company:** {{companyName}}

## Acceptance of Terms

By using our services, you agree to these terms.

## Description of Service

{{serviceDescription}}

## User Responsibilities

You are responsible for maintaining the confidentiality of your account.

## Limitation of Liability

{{limitationClause}}

## Contact

For questions about these terms, contact {{contactEmail}}.`,
      variables: [
        { name: 'date', description: 'Last updated date', required: true },
        { name: 'companyName', description: 'Company name', required: true },
        { name: 'serviceDescription', description: 'Description of service', required: true },
        { name: 'limitationClause', description: 'Limitation of liability clause', required: true },
        { name: 'contactEmail', description: 'Contact email', required: true }
      ]
    });

    // Data Processing Agreement Template
    this.templates.set('dpa', {
      id: 'dpa',
      name: 'Data Processing Agreement',
      type: 'dpa',
      framework: ['GDPR'],
      content: `# Data Processing Agreement

**Parties:**
- Data Controller: {{controllerName}}
- Data Processor: {{processorName}}

## Scope of Processing

{{processingScope}}

## Security Measures

{{securityMeasures}}

## Data Subject Rights

{{dataSubjectRights}}

## Term and Termination

{{terminationClause}}`,
      variables: [
        { name: 'controllerName', description: 'Data controller name', required: true },
        { name: 'processorName', description: 'Data processor name', required: true },
        { name: 'processingScope', description: 'Scope of data processing', required: true },
        { name: 'securityMeasures', description: 'Security measures description', required: true },
        { name: 'dataSubjectRights', description: 'Data subject rights description', required: true },
        { name: 'terminationClause', description: 'Termination clause', required: true }
      ]
    });
  }
}

// Export singleton instance
export const policyTemplateManager = new PolicyTemplateManager();
