/**
 * Main Instant Payouts Direct Deposit Class
 * 
 * Comprehensive instant payout and direct deposit system for enterprise
 * financial operations, payment processing, and fund management.
 */

import { InstantPayoutsConfig, InstantPayoutsMetrics, PayoutProcessing, DirectDeposit, ComplianceMonitoring, ReliabilityEngine } from './types.js';
import { payoutProcessing } from './payout-processing.js';
import { directDeposit } from './direct-deposit.js';
import { complianceMonitoring } from './compliance-monitoring.js';
import { reliabilityEngine } from './reliability-engine.js';

export class InstantPayoutsDirectDeposit {
  private config: InstantPayoutsConfig;
  private initialized = false;

  constructor(config: Partial<InstantPayoutsConfig> = {}) {
    this.config = {
      payouts: {
        enabled: true,
        processing: true,
        validation: true,
        scheduling: true,
        tracking: true,
        ...config.payouts
      },
      directDeposit: {
        enabled: true,
        verification: true,
        routing: true,
        settlement: true,
        reconciliation: true,
        ...config.directDeposit
      },
      compliance: {
        enabled: true,
        monitoring: true,
        reporting: true,
        riskAssessment: true,
        auditTrail: true,
        ...config.compliance
      },
      reliability: {
        enabled: true,
        monitoring: true,
        failover: true,
        scaling: true,
        performance: true,
        ...config.reliability
      }
    };
  }

  /**
   * Initialize the instant payouts direct deposit system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all payout components
      await payoutProcessing.initialize(this.config.payouts);
      await directDeposit.initialize(this.config.directDeposit);
      await complianceMonitoring.initialize(this.config.compliance);
      await reliabilityEngine.initialize(this.config.reliability);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize instant payouts direct deposit system:', error);
      throw error;
    }
  }

  /**
   * Setup payout processing
   */
  async setupPayoutProcessing(): Promise<void> {
    if (!this.config.payouts.enabled) {
      throw new Error('Payout processing not enabled');
    }

    try {
      await payoutProcessing.setupProcessing();
      await payoutProcessing.setupValidation();
      await payoutProcessing.setupScheduling();
      await payoutProcessing.setupTracking();
    } catch (error) {
      console.error('Failed to setup payout processing:', error);
      throw error;
    }
  }

  /**
   * Setup direct deposit
   */
  async setupDirectDeposit(): Promise<void> {
    if (!this.config.directDeposit.enabled) {
      throw new Error('Direct deposit not enabled');
    }

    try {
      await directDeposit.setupVerification();
      await directDeposit.setupRouting();
      await directDeposit.setupSettlement();
      await directDeposit.setupReconciliation();
    } catch (error) {
      console.error('Failed to setup direct deposit:', error);
      throw error;
    }
  }

  /**
   * Setup compliance monitoring
   */
  async setupComplianceMonitoring(): Promise<void> {
    if (!this.config.compliance.enabled) {
      throw new Error('Compliance monitoring not enabled');
    }

    try {
      await complianceMonitoring.setupMonitoring();
      await complianceMonitoring.setupReporting();
      await complianceMonitoring.setupRiskAssessment();
      await complianceMonitoring.setupAuditTrail();
    } catch (error) {
      console.error('Failed to setup compliance monitoring:', error);
      throw error;
    }
  }

  /**
   * Setup reliability engine
   */
  async setupReliabilityEngine(): Promise<void> {
    if (!this.config.reliability.enabled) {
      throw new Error('Reliability engine not enabled');
    }

    try {
      await reliabilityEngine.setupMonitoring();
      await reliabilityEngine.setupFailover();
      await reliabilityEngine.setupScaling();
      await reliabilityEngine.setupPerformance();
    } catch (error) {
      console.error('Failed to setup reliability engine:', error);
      throw error;
    }
  }

  /**
   * Get payout processing data
   */
  async getPayoutProcessing(): Promise<PayoutProcessing> {
    try {
      return await payoutProcessing.getProcessing();
    } catch (error) {
      console.error('Failed to get payout processing:', error);
      throw error;
    }
  }

  /**
   * Get direct deposit data
   */
  async getDirectDeposit(): Promise<DirectDeposit> {
    try {
      return await directDeposit.getDeposit();
    } catch (error) {
      console.error('Failed to get direct deposit:', error);
      throw error;
    }
  }

  /**
   * Get compliance monitoring data
   */
  async getComplianceMonitoring(): Promise<ComplianceMonitoring> {
    try {
      return await complianceMonitoring.getMonitoring();
    } catch (error) {
      console.error('Failed to get compliance monitoring:', error);
      throw error;
    }
  }

  /**
   * Get reliability engine data
   */
  async getReliabilityEngine(): Promise<ReliabilityEngine> {
    try {
      return await reliabilityEngine.getEngine();
    } catch (error) {
      console.error('Failed to get reliability engine:', error);
      throw error;
    }
  }

  /**
   * Create payout transaction
   */
  async createPayoutTransaction(transaction: any): Promise<any> {
    try {
      return await payoutProcessing.createTransaction(transaction);
    } catch (error) {
      console.error('Failed to create payout transaction:', error);
      throw error;
    }
  }

  /**
   * Process instant payout
   */
  async processInstantPayout(transactionId: string): Promise<any> {
    try {
      return await payoutProcessing.processInstantPayout(transactionId);
    } catch (error) {
      console.error('Failed to process instant payout:', error);
      throw error;
    }
  }

  /**
   * Verify direct deposit account
   */
  async verifyDirectDepositAccount(accountInfo: any): Promise<any> {
    try {
      return await directDeposit.verifyAccount(accountInfo);
    } catch (error) {
      console.error('Failed to verify direct deposit account:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive payout report
   */
  async generatePayoutReport(period: string): Promise<{
    summary: any;
    payouts: any;
    directDeposit: any;
    compliance: any;
    reliability: any;
    insights: any[];
  }> {
    try {
      const metrics = await this.getMetrics();
      const payoutProcessing = await this.getPayoutProcessing();
      const directDeposit = await this.getDirectDeposit();
      const complianceMonitoring = await this.getComplianceMonitoring();
      const reliabilityEngine = await this.getReliabilityEngine();

      return {
        summary: {
          totalProcessed: metrics.overall.totalProcessed,
          successRate: metrics.overall.successRate,
          averageProcessingTime: metrics.overall.averageProcessingTime,
          complianceScore: metrics.overall.complianceScore,
          period
        },
        payouts: {
          totalPayouts: metrics.payouts.totalPayouts,
          successfulPayouts: metrics.payouts.successfulPayouts,
          failedPayouts: metrics.payouts.failedPayouts,
          averageAmount: metrics.payouts.averageAmount,
          processingTime: metrics.payouts.processingTime,
          queueLength: metrics.payouts.queueLength,
          transactions: payoutProcessing.transactions.length,
          batches: payoutProcessing.batches.length
        },
        directDeposit: {
          accountsVerified: metrics.directDeposit.accountsVerified,
          depositsProcessed: metrics.directDeposit.depositsProcessed,
          settlementTime: metrics.directDeposit.settlementTime,
          reconciliationAccuracy: metrics.directDeposit.reconciliationAccuracy,
          routingSuccess: metrics.directDeposit.routingSuccess,
          accounts: directDeposit.accounts.length,
          verifications: directDeposit.verification.length
        },
        compliance: {
          riskAssessments: metrics.compliance.riskAssessments,
          alertsTriggered: metrics.compliance.alertsTriggered,
          auditLogs: metrics.compliance.auditLogs,
          complianceScore: metrics.compliance.complianceScore,
          violations: metrics.compliance.violations,
          riskAssessmentsCount: complianceMonitoring.riskAssessments.length,
          alertsCount: complianceMonitoring.alerts.length
        },
        reliability: {
          uptime: metrics.reliability.uptime,
          failoverEvents: metrics.reliability.failoverEvents,
          responseTime: metrics.reliability.responseTime,
          throughput: metrics.reliability.throughput,
          errorRate: metrics.reliability.errorRate,
          systemHealth: reliabilityEngine.health.overall
        },
        insights: [
          {
            type: 'performance',
            title: 'Processing Performance',
            description: `Average processing time is ${metrics.overall.averageProcessingTime}ms with ${metrics.overall.successRate}% success rate`,
            impact: 'positive',
            recommendation: 'Maintain current processing parameters'
          },
          {
            type: 'compliance',
            title: 'Compliance Status',
            description: `Compliance score at ${metrics.overall.complianceScore}% with ${metrics.compliance.violations} violations`,
            impact: metrics.compliance.violations > 0 ? 'negative' : 'positive',
            recommendation: metrics.compliance.violations > 0 ? 'Address compliance violations immediately' : 'Continue compliance monitoring'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate payout report:', error);
      throw error;
    }
  }

  /**
   * Get instant payouts metrics
   */
  async getMetrics(): Promise<InstantPayoutsMetrics> {
    try {
      const payoutMetrics = await payoutProcessing.getMetrics();
      const directDepositMetrics = await directDeposit.getMetrics();
      const complianceMetrics = await complianceMonitoring.getMetrics();
      const reliabilityMetrics = await reliabilityEngine.getMetrics();

      return {
        payouts: payoutMetrics,
        directDeposit: directDepositMetrics,
        compliance: complianceMetrics,
        reliability: reliabilityMetrics,
        overall: {
          totalProcessed: payoutMetrics.totalPayouts,
          successRate: (payoutMetrics.successfulPayouts / payoutMetrics.totalPayouts) * 100,
          averageProcessingTime: payoutMetrics.processingTime,
          complianceScore: complianceMetrics.complianceScore
        }
      };
    } catch (error) {
      console.error('Failed to get instant payouts metrics:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): InstantPayoutsConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<InstantPayoutsConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    payouts: boolean;
    directDeposit: boolean;
    compliance: boolean;
    reliability: boolean;
  }> {
    try {
      const payouts = this.config.payouts.enabled ? await payoutProcessing.getHealthStatus() : true;
      const directDeposit = this.config.directDeposit.enabled ? await directDeposit.getHealthStatus() : true;
      const compliance = this.config.compliance.enabled ? await complianceMonitoring.getHealthStatus() : true;
      const reliability = this.config.reliability.enabled ? await reliabilityEngine.getHealthStatus() : true;

      return {
        overall: this.initialized && payouts && directDeposit && compliance && reliability,
        payouts,
        directDeposit,
        compliance,
        reliability
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        payouts: false,
        directDeposit: false,
        compliance: false,
        reliability: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await payoutProcessing.cleanup();
    await directDeposit.cleanup();
    await complianceMonitoring.cleanup();
    await reliabilityEngine.cleanup();
  }
}

// Export default instance
export const instantPayoutsDirectDeposit = new InstantPayoutsDirectDeposit();
