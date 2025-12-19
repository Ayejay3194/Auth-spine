/**
 * Type definitions for Vibe Coding Disasters Kit
 */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskItem {
  id: string;
  category: string;
  subcategory: string;
  text: string;
  severity: SeverityLevel;
  description?: string;
  mitigation?: string;
  examples?: string[];
  tags?: string[];
}

export interface RiskCategory {
  name: string;
  description: string;
  itemCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface RiskRegister {
  generated_at: string;
  item_count: number;
  items: RiskItem[];
  categories: RiskCategory[];
}

export interface ChecklistConfig {
  includeCategories: string[];
  excludeCategories: string[];
  minSeverity: SeverityLevel;
  includeMitigations: boolean;
  includeExamples: boolean;
  format: 'markdown' | 'json' | 'html';
}

export interface PRChecklistOptions {
  blockOnCritical: boolean;
  blockOnHigh: boolean;
  requireSignoff: boolean;
  customChecks: string[];
  excludeChecks: string[];
}

export interface RiskAssessment {
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScore: number;
  recommendations: string[];
  blocked: boolean;
}

export interface VibeCodingConfig {
  enableBlocking: boolean;
  blockOnCritical: boolean;
  blockOnHigh: boolean;
  requireSignoff: boolean;
  autoGeneratePR: boolean;
  categories: string[];
  customRules?: CustomRule[];
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  severity: SeverityLevel;
  check: (context: any) => boolean;
  mitigation?: string;
}
