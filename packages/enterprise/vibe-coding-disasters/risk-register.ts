/**
 * Risk Register for Vibe Coding Disasters
 * 
 * This contains the complete list of things that can go wrong with "vibe coding"
 * (fast prototyping without guardrails).
 */

import { RiskRegister, RiskItem, RiskCategory } from './types.js';
import { readFileSync } from 'fs';

// Load risk data from JSON file
const riskData: RiskRegister = JSON.parse(
  readFileSync(
    new URL('./data/risk-register.json', import.meta.url),
    'utf-8'
  )
);

export class RiskRegisterManager {
  private riskData: RiskRegister;

  constructor() {
    this.riskData = riskData;
  }

  /**
   * Get all risk items
   */
  getAllRisks(): RiskItem[] {
    return this.riskData.items;
  }

  /**
   * Get risks by category
   */
  getRisksByCategory(category: string): RiskItem[] {
    return this.riskData.items.filter(item => item.category === category);
  }

  /**
   * Get risks by severity
   */
  getRisksBySeverity(severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'): RiskItem[] {
    return this.riskData.items.filter(item => item.severity === severity);
  }

  /**
   * Get risks by subcategory
   */
  getRisksBySubcategory(subcategory: string): RiskItem[] {
    return this.riskData.items.filter(item => item.subcategory === subcategory);
  }

  /**
   * Search risks by text
   */
  searchRisks(query: string): RiskItem[] {
    const lowerQuery = query.toLowerCase();
    return this.riskData.items.filter(item => 
      item.text.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.subcategory.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get risk categories summary
   */
  getCategoriesSummary(): RiskCategory[] {
    const categories = new Map<string, RiskCategory>();

    this.riskData.items.forEach(item => {
      const existing = categories.get(item.category);
      if (existing) {
        existing.itemCount++;
        if (item.severity === 'CRITICAL') existing.criticalCount++;
        else if (item.severity === 'HIGH') existing.highCount++;
        else if (item.severity === 'MEDIUM') existing.mediumCount++;
        else if (item.severity === 'LOW') existing.lowCount++;
      } else {
        categories.set(item.category, {
          name: item.category,
          description: this.getCategoryDescription(item.category),
          itemCount: 1,
          criticalCount: item.severity === 'CRITICAL' ? 1 : 0,
          highCount: item.severity === 'HIGH' ? 1 : 0,
          mediumCount: item.severity === 'MEDIUM' ? 1 : 0,
          lowCount: item.severity === 'LOW' ? 1 : 0
        });
      }
    });

    return Array.from(categories.values());
  }

  /**
   * Get risk by ID
   */
  getRiskById(id: string): RiskItem | undefined {
    return this.riskData.items.find(item => item.id === id);
  }

  /**
   * Get full risk register
   */
  getRiskRegister(): RiskRegister {
    return this.riskData;
  }

  /**
   * Assess risk level for a given context
   */
  assessRisks(context: any): {
    applicable: RiskItem[];
    critical: RiskItem[];
    high: RiskItem[];
    medium: RiskItem[];
    low: RiskItem[];
    blocked: boolean;
  } {
    // This would be customized based on actual context
    // For now, return all risks as potentially applicable
    const allRisks = this.getAllRisks();
    const critical = allRisks.filter(r => r.severity === 'CRITICAL');
    const high = allRisks.filter(r => r.severity === 'HIGH');
    const medium = allRisks.filter(r => r.severity === 'MEDIUM');
    const low = allRisks.filter(r => r.severity === 'LOW');

    return {
      applicable: allRisks,
      critical,
      high,
      medium,
      low,
      blocked: critical.length > 0
    };
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'SECURITY VULNERABILITIES': 'Security flaws that can lead to data breaches, unauthorized access, and system compromise',
      'DATABASE DISASTERS': 'Database design and query issues that can cause data loss, corruption, or performance problems',
      'FINANCIAL_BUSINESS_DISASTERS': 'Financial and business logic errors that can lead to monetary loss or regulatory issues',
      'LEGAL_COMPLIANCE_DISASTERS': 'Legal and compliance issues that can result in lawsuits, fines, or regulatory action',
      'OPERATIONAL_DISASTERS': 'Operational issues that can cause system downtime, data loss, or poor user experience',
      'ANALYTICS_TRACKING_DISASTERS': 'Analytics and tracking issues that can lead to bad data and poor business decisions',
      'CONFIGURATION_SETTINGS_DISASTERS': 'Configuration and settings issues that can cause system misbehavior or security holes',
      'CRON_SCHEDULED_TASKS_DISASTERS': 'Scheduled task issues that can cause missed jobs, duplicate work, or system problems',
      'EDGE_CASES_RARE_FAILURES': 'Edge cases and rare failure scenarios that can cause unexpected behavior',
      'EMAIL_NOTIFICATIONS_DISASTERS': 'Email and notification issues that can cause communication failures or spam',
      'IMPORT_EXPORT_DISASTERS': 'Data import/export issues that can cause data loss, corruption, or security problems',
      'LOCALIZATION_I18N_DISASTERS': 'Internationalization and localization issues that can cause poor user experience',
      'MIGRATION_DISASTERS': 'Data migration issues that can cause data loss, corruption, or system downtime',
      'MOBILE_DISASTERS': 'Mobile-specific issues that can cause poor user experience or security problems',
      'MULTI_TENANCY_DISASTERS': 'Multi-tenancy issues that can cause data leaks or system problems',
      'QUEUE_BACKGROUND_JOBS_DISASTERS': 'Queue and background job issues that can cause lost work or system problems',
      'SEARCH_FILTERING_DISASTERS': 'Search and filtering issues that can cause poor user experience or performance problems',
      'WEBSOCKET_REALTIME_DISASTERS': 'WebSocket and real-time issues that can cause connection problems or security holes'
    };

    return descriptions[category] || 'Category description not available';
  }
}

// Export singleton instance
export const riskRegister = new RiskRegisterManager();
