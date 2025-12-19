/**
 * Main Financial Reporting Dashboard Class
 * 
 * Comprehensive financial reporting and analytics dashboard for enterprise
 * financial operations, reporting, and analysis.
 */

import { FinancialReportingConfig, FinancialReportingMetrics, RevenueAnalytics, ExpenseTracking, FinancialPlanning, ComplianceReporting } from './types.js';
import { revenueAnalytics } from './revenue-analytics.js';
import { expenseTracking } from './expense-tracking.js';
import { financialPlanning } from './financial-planning.js';
import { complianceReporting } from './compliance-reporting.js';

export class FinancialReportingDashboard {
  private config: FinancialReportingConfig;
  private initialized = false;

  constructor(config: Partial<FinancialReportingConfig> = {}) {
    this.config = {
      revenue: {
        enabled: true,
        analytics: true,
        forecasting: true,
        segmentation: true,
        reporting: true,
        ...config.revenue
      },
      expenses: {
        enabled: true,
        tracking: true,
        categorization: true,
        budgeting: true,
        optimization: true,
        ...config.expenses
      },
      planning: {
        enabled: true,
        budgeting: true,
        forecasting: true,
        scenarios: true,
        analysis: true,
        ...config.planning
      },
      compliance: {
        enabled: true,
        reporting: true,
        audits: true,
        regulations: true,
        documentation: true,
        ...config.compliance
      }
    };
  }

  /**
   * Initialize the financial reporting dashboard
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all financial components
      await revenueAnalytics.initialize(this.config.revenue);
      await expenseTracking.initialize(this.config.expenses);
      await financialPlanning.initialize(this.config.planning);
      await complianceReporting.initialize(this.config.compliance);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize financial reporting dashboard:', error);
      throw error;
    }
  }

  /**
   * Setup revenue analytics
   */
  async setupRevenueAnalytics(): Promise<void> {
    if (!this.config.revenue.enabled) {
      throw new Error('Revenue analytics not enabled');
    }

    try {
      await revenueAnalytics.setupAnalytics();
      await revenueAnalytics.setupForecasting();
      await revenueAnalytics.setupSegmentation();
      await revenueAnalytics.setupReporting();
    } catch (error) {
      console.error('Failed to setup revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Setup expense tracking
   */
  async setupExpenseTracking(): Promise<void> {
    if (!this.config.expenses.enabled) {
      throw new Error('Expense tracking not enabled');
    }

    try {
      await expenseTracking.setupTracking();
      await expenseTracking.setupCategorization();
      await expenseTracking.setupBudgeting();
      await expenseTracking.setupOptimization();
    } catch (error) {
      console.error('Failed to setup expense tracking:', error);
      throw error;
    }
  }

  /**
   * Setup financial planning
   */
  async setupFinancialPlanning(): Promise<void> {
    if (!this.config.planning.enabled) {
      throw new Error('Financial planning not enabled');
    }

    try {
      await financialPlanning.setupBudgeting();
      await financialPlanning.setupForecasting();
      await financialPlanning.setupScenarios();
      await financialPlanning.setupAnalysis();
    } catch (error) {
      console.error('Failed to setup financial planning:', error);
      throw error;
    }
  }

  /**
   * Setup compliance reporting
   */
  async setupComplianceReporting(): Promise<void> {
    if (!this.config.compliance.enabled) {
      throw new Error('Compliance reporting not enabled');
    }

    try {
      await complianceReporting.setupReporting();
      await complianceReporting.setupAudits();
      await complianceReporting.setupRegulations();
      await complianceReporting.setupDocumentation();
    } catch (error) {
      console.error('Failed to setup compliance reporting:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    try {
      return await revenueAnalytics.getAnalytics();
    } catch (error) {
      console.error('Failed to get revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Get expense tracking
   */
  async getExpenseTracking(): Promise<ExpenseTracking> {
    try {
      return await expenseTracking.getTracking();
    } catch (error) {
      console.error('Failed to get expense tracking:', error);
      throw error;
    }
  }

  /**
   * Get financial planning
   */
  async getFinancialPlanning(): Promise<FinancialPlanning> {
    try {
      return await financialPlanning.getPlanning();
    } catch (error) {
      console.error('Failed to get financial planning:', error);
      throw error;
    }
  }

  /**
   * Get compliance reporting
   */
  async getComplianceReporting(): Promise<ComplianceReporting> {
    try {
      return await complianceReporting.getReporting();
    } catch (error) {
      console.error('Failed to get compliance reporting:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive financial report
   */
  async generateFinancialReport(period: string): Promise<{
    summary: any;
    revenue: any;
    expenses: any;
    planning: any;
    compliance: any;
    insights: any[];
  }> {
    try {
      const metrics = await this.getMetrics();
      const revenueAnalytics = await this.getRevenueAnalytics();
      const expenseTracking = await this.getExpenseTracking();
      const financialPlanning = await this.getFinancialPlanning();
      const complianceReporting = await this.getComplianceReporting();

      return {
        summary: {
          totalRevenue: metrics.overall.totalRevenue,
          totalExpenses: metrics.overall.totalExpenses,
          netIncome: metrics.overall.netIncome,
          profitMargin: metrics.overall.profitMargin,
          growthRate: metrics.overall.growthRate,
          period
        },
        revenue: {
          monthlyRevenue: metrics.revenue.monthlyRevenue,
          yearlyRevenue: metrics.revenue.yearlyRevenue,
          revenueGrowth: metrics.revenue.revenueGrowth,
          averageRevenuePerCustomer: metrics.revenue.averageRevenuePerCustomer,
          forecastAccuracy: metrics.revenue.forecastAccuracy,
          streams: revenueAnalytics.revenueStreams.length,
          segments: revenueAnalytics.customerSegments.length
        },
        expenses: {
          monthlyExpenses: metrics.expenses.monthlyExpenses,
          yearlyExpenses: metrics.expenses.yearlyExpenses,
          expenseGrowth: metrics.expenses.expenseGrowth,
          costOptimization: metrics.expenses.costOptimization,
          budgetVariance: metrics.expenses.budgetVariance,
          categories: expenseTracking.categories.length,
          budgets: expenseTracking.budgets.length
        },
        planning: {
          budgetUtilization: metrics.planning.budgetUtilization,
          forecastAccuracy: metrics.planning.forecastAccuracy,
          scenarioAnalysis: metrics.planning.scenarioAnalysis,
          planningEfficiency: metrics.planning.planningEfficiency,
          riskAssessment: metrics.planning.riskAssessment,
          forecasts: financialPlanning.forecasts.length,
          scenarios: financialPlanning.scenarios.length
        },
        compliance: {
          reportsGenerated: metrics.compliance.reportsGenerated,
          auditsCompleted: metrics.compliance.auditsCompleted,
          complianceScore: metrics.compliance.complianceScore,
          regulatoryAdherence: metrics.compliance.regulatoryAdherence,
          documentationComplete: metrics.compliance.documentationComplete,
          frameworks: complianceReporting.frameworks.length,
          reports: complianceReporting.reports.length
        },
        insights: [
          {
            type: 'revenue',
            title: 'Revenue Growth Trend',
            description: `Revenue growing at ${metrics.overall.growthRate}% year-over-year`,
            impact: 'positive',
            recommendation: 'Continue current growth strategies'
          },
          {
            type: 'expenses',
            title: 'Cost Optimization Opportunity',
            description: `${metrics.expenses.costOptimization}% potential savings identified`,
            impact: 'opportunity',
            recommendation: 'Review and implement cost optimization measures'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate financial report:', error);
      throw error;
    }
  }

  /**
   * Get financial metrics
   */
  async getMetrics(): Promise<FinancialReportingMetrics> {
    try {
      const revenueMetrics = await revenueAnalytics.getMetrics();
      const expenseMetrics = await expenseTracking.getMetrics();
      const planningMetrics = await financialPlanning.getMetrics();
      const complianceMetrics = await complianceReporting.getMetrics();

      return {
        revenue: revenueMetrics,
        expenses: expenseMetrics,
        planning: planningMetrics,
        compliance: complianceMetrics,
        overall: {
          totalRevenue: revenueMetrics.yearlyRevenue,
          totalExpenses: expenseMetrics.yearlyExpenses,
          netIncome: revenueMetrics.yearlyRevenue - expenseMetrics.yearlyExpenses,
          profitMargin: ((revenueMetrics.yearlyRevenue - expenseMetrics.yearlyExpenses) / revenueMetrics.yearlyRevenue) * 100,
          growthRate: revenueMetrics.revenueGrowth
        }
      };
    } catch (error) {
      console.error('Failed to get financial metrics:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): FinancialReportingConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<FinancialReportingConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    revenue: boolean;
    expenses: boolean;
    planning: boolean;
    compliance: boolean;
  }> {
    try {
      const revenue = this.config.revenue.enabled ? await revenueAnalytics.getHealthStatus() : true;
      const expenses = this.config.expenses.enabled ? await expenseTracking.getHealthStatus() : true;
      const planning = this.config.planning.enabled ? await financialPlanning.getHealthStatus() : true;
      const compliance = this.config.compliance.enabled ? await complianceReporting.getHealthStatus() : true;

      return {
        overall: this.initialized && revenue && expenses && planning && compliance,
        revenue,
        expenses,
        planning,
        compliance
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        revenue: false,
        expenses: false,
        planning: false,
        compliance: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await revenueAnalytics.cleanup();
    await expenseTracking.cleanup();
    await financialPlanning.cleanup();
    await complianceReporting.cleanup();
  }
}

// Export default instance
export const financialReportingDashboard = new FinancialReportingDashboard();
