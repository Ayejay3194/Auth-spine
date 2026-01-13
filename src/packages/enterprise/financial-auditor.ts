/**
 * Financial Auditor - Comprehensive financial transaction auditing
 */

import { 
  FinancialTransaction,
  TransactionApproval,
  TransactionStatus,
  TransactionType,
  TransactionCategory,
  AuditEntry,
  ComplianceCheck,
  ValidationResult,
  ValidationError,
  ErrorSeverity,
  ErrorCategory
} from './types';
import { ValidationService } from './service';
import { AuditTrailManager } from './audit-trail';
import { ComplianceValidator } from './compliance';

export class FinancialAuditor {
  private validationService: ValidationService;
  private auditManager: AuditTrailManager;
  private complianceValidator: ComplianceValidator;

  constructor() {
    this.validationService = new ValidationService();
    this.auditManager = new AuditTrailManager();
    this.complianceValidator = new ComplianceValidator();
  }

  /**
   * Audit financial transaction with comprehensive checks
   */
  async auditTransaction(transaction: FinancialTransaction): Promise<{
    isValid: boolean;
    auditReport: AuditReport;
    complianceStatus: ComplianceStatus;
    riskAssessment: RiskAssessment;
    recommendations: string[];
  }> {
    // Validate transaction
    const validationResult = await this.validationService.validateFinancialTransaction(transaction);
    
    // Perform financial compliance checks
    const complianceChecks = await this.complianceValidator.validateFinancialCompliance(transaction);
    
    // Assess transaction risk
    const riskAssessment = await this.assessTransactionRisk(transaction);
    
    // Generate audit report
    const auditReport = await this.generateAuditReport(transaction, validationResult, complianceChecks, riskAssessment);
    
    // Create recommendations
    const recommendations = this.generateRecommendations(transaction, validationResult, riskAssessment);

    const complianceStatus = this.determineComplianceStatus(complianceChecks);

    return {
      isValid: validationResult.isValid && complianceStatus === 'compliant',
      auditReport,
      complianceStatus,
      riskAssessment,
      recommendations
    };
  }

  /**
   * Audit payroll transactions with enhanced compliance
   */
  async auditPayrollTransaction(payrollData: any): Promise<{
    isValid: boolean;
    auditReport: AuditReport;
    complianceIssues: ComplianceIssue[];
    taxCompliance: TaxComplianceResult;
    recommendations: string[];
  }> {
    // Validate payroll calculation
    const validationResult = await this.validationService.validatePayrollCalculation(payrollData);
    
    // Perform payroll compliance checks
    const complianceChecks = await this.complianceValidator.validatePayrollCompliance(payrollData);
    
    // Validate tax calculations
    const taxCompliance = await this.validateTaxCalculations(payrollData);
    
    // Check for payroll anomalies
    const anomalies = await this.detectPayrollAnomalies(payrollData);
    
    // Generate payroll audit report
    const auditReport = await this.generatePayrollAuditReport(payrollData, validationResult, complianceChecks, taxCompliance, anomalies);
    
    // Identify compliance issues
    const complianceIssues = this.identifyComplianceIssues(complianceChecks, taxCompliance);
    
    // Generate payroll-specific recommendations
    const recommendations = this.generatePayrollRecommendations(payrollData, validationResult, anomalies);

    return {
      isValid: validationResult.isValid && complianceIssues.length === 0,
      auditReport,
      complianceIssues,
      taxCompliance,
      recommendations
    };
  }

  /**
   * Audit booking transactions with business rule validation
   */
  async auditBookingTransaction(bookingData: any): Promise<{
    isValid: boolean;
    auditReport: AuditReport;
    businessRuleCompliance: BusinessRuleResult;
    revenueValidation: RevenueValidationResult;
    recommendations: string[];
  }> {
    // Validate booking data
    const validationResult = await this.validationService.validateBooking(bookingData);
    
    // Check business rule compliance
    const businessRuleCompliance = await this.validateBusinessRules(bookingData);
    
    // Validate revenue calculations
    const revenueValidation = await this.validateRevenueCalculation(bookingData);
    
    // Check for booking anomalies
    const anomalies = await this.detectBookingAnomalies(bookingData);
    
    // Generate booking audit report
    const auditReport = await this.generateBookingAuditReport(bookingData, validationResult, businessRuleCompliance, revenueValidation, anomalies);
    
    // Generate booking recommendations
    const recommendations = this.generateBookingRecommendations(bookingData, validationResult, anomalies);

    return {
      isValid: validationResult.isValid && businessRuleCompliance.isCompliant,
      auditReport,
      businessRuleCompliance,
      revenueValidation,
      recommendations
    };
  }

  /**
   * Audit inventory transactions with stock validation
   */
  async auditInventoryTransaction(inventoryData: any): Promise<{
    isValid: boolean;
    auditReport: AuditReport;
    stockValidation: StockValidationResult;
    costAnalysis: CostAnalysisResult;
    recommendations: string[];
  }> {
    // Validate inventory transaction
    const validationResult = await this.validationService.validateInventoryTransaction(inventoryData);
    
    // Validate stock levels
    const stockValidation = await this.validateStockLevels(inventoryData);
    
    // Analyze cost implications
    const costAnalysis = await this.analyzeCostImplications(inventoryData);
    
    // Check for inventory anomalies
    const anomalies = await this.detectInventoryAnomalies(inventoryData);
    
    // Generate inventory audit report
    const auditReport = await this.generateInventoryAuditReport(inventoryData, validationResult, stockValidation, costAnalysis, anomalies);
    
    // Generate inventory recommendations
    const recommendations = this.generateInventoryRecommendations(inventoryData, validationResult, anomalies);

    return {
      isValid: validationResult.isValid && stockValidation.isValid,
      auditReport,
      stockValidation,
      costAnalysis,
      recommendations
    };
  }

  /**
   * Perform batch audit for multiple transactions
   */
  async auditBatchTransactions(transactions: FinancialTransaction[]): Promise<{
    totalTransactions: number;
    validTransactions: number;
    invalidTransactions: number;
    highRiskTransactions: number;
    complianceScore: number;
    batchReport: BatchAuditReport;
    recommendations: string[];
  }> {
    const results = await Promise.all(
      transactions.map(transaction => this.auditTransaction(transaction))
    );

    const totalTransactions = transactions.length;
    const validTransactions = results.filter(r => r.isValid).length;
    const invalidTransactions = totalTransactions - validTransactions;
    const highRiskTransactions = results.filter(r => r.riskAssessment.overallRisk === 'high' || r.riskAssessment.overallRisk === 'critical').length;
    
    const complianceScore = Math.round(
      results.reduce((sum, r) => sum + (r.complianceStatus === 'compliant' ? 1 : 0), 0) / totalTransactions * 100
    );

    const batchReport = await this.generateBatchAuditReport(transactions, results);
    const recommendations = this.generateBatchRecommendations(results);

    return {
      totalTransactions,
      validTransactions,
      invalidTransactions,
      highRiskTransactions,
      complianceScore,
      batchReport,
      recommendations
    };
  }

  /**
   * Generate financial audit dashboard
   */
  async generateFinancialAuditDashboard(period: { start: Date; end: Date }): Promise<{
    summary: FinancialSummary;
    complianceMetrics: ComplianceMetrics;
    riskMetrics: RiskMetrics;
    trendAnalysis: TrendAnalysis;
    alerts: AuditAlert[];
  }> {
    // Mock implementation - would generate actual dashboard data
    return {
      summary: {
        totalTransactions: 0,
        totalValue: 0,
        compliantTransactions: 0,
        highRiskTransactions: 0
      },
      complianceMetrics: {
        overallScore: 0,
        soxCompliance: 0,
        pciCompliance: 0,
        amlCompliance: 0
      },
      riskMetrics: {
        overallRiskLevel: 'low',
        riskDistribution: {},
        emergingRisks: []
      },
      trendAnalysis: {
        transactionVolume: [],
        complianceTrend: [],
        riskTrend: []
      },
      alerts: []
    };
  }

  // Private helper methods

  private async assessTransactionRisk(transaction: FinancialTransaction): Promise<RiskAssessment> {
    const riskFactors: RiskFactor[] = [];
    let overallRisk: RiskLevel = 'low';

    // Amount-based risk assessment
    if (transaction.amount > 100000) {
      riskFactors.push({
        factor: 'high_amount',
        description: 'Transaction amount exceeds $100,000',
        riskLevel: 'high',
        weight: 0.3
      });
    } else if (transaction.amount > 10000) {
      riskFactors.push({
        factor: 'medium_amount',
        description: 'Transaction amount exceeds $10,000',
        riskLevel: 'medium',
        weight: 0.2
      });
    }

    // Transaction type risk assessment
    if (transaction.type === TransactionType.REFUND) {
      riskFactors.push({
        factor: 'refund_transaction',
        description: 'Refund transactions require additional scrutiny',
        riskLevel: 'medium',
        weight: 0.2
      });
    }

    // Time-based risk assessment
    const transactionHour = transaction.createdAt.getHours();
    if (transactionHour < 6 || transactionHour > 22) {
      riskFactors.push({
        factor: 'unusual_time',
        description: 'Transaction outside normal business hours',
        riskLevel: 'medium',
        weight: 0.1
      });
    }

    // Frequency risk assessment
    const recentTransactions = await this.getRecentTransactionCount(transaction.fromAccount, 24);
    if (recentTransactions > 10) {
      riskFactors.push({
        factor: 'high_frequency',
        description: 'High transaction frequency in 24 hours',
        riskLevel: 'high',
        weight: 0.3
      });
    }

    // Calculate overall risk
    const riskScore = riskFactors.reduce((sum, factor) => sum + (factor.weight * this.getRiskScore(factor.riskLevel)), 0);
    
    if (riskScore >= 0.7) {
      overallRisk = 'critical';
    } else if (riskScore >= 0.5) {
      overallRisk = 'high';
    } else if (riskScore >= 0.3) {
      overallRisk = 'medium';
    }

    return {
      overallRisk,
      riskFactors,
      riskScore,
      recommendations: this.generateRiskRecommendations(riskFactors)
    };
  }

  private async generateAuditReport(
    transaction: FinancialTransaction,
    validation: ValidationResult,
    compliance: ComplianceCheck[],
    risk: RiskAssessment
  ): Promise<AuditReport> {
    return {
      id: this.generateReportId(),
      transactionId: transaction.id,
      transactionType: transaction.type,
      timestamp: new Date(),
      validationResult: validation,
      complianceChecks: compliance,
      riskAssessment: risk,
      auditorId: 'system',
      status: validation.isValid ? 'approved' : 'requires_review',
      findings: this.generateFindings(validation, compliance, risk),
      recommendations: this.generateRecommendations(transaction, validation, risk)
    };
  }

  private async validateTaxCalculations(payrollData: any): Promise<TaxComplianceResult> {
    // Mock implementation - would validate actual tax calculations
    return {
      federalTaxValid: true,
      stateTaxValid: true,
      localTaxValid: true,
      ficaValid: true,
      totalTaxAmount: payrollData.taxes?.total || 0,
      validationDetails: {
        federalCalculation: 'Valid',
        stateCalculation: 'Valid',
        ficaCalculation: 'Valid'
      }
    };
  }

  private async detectPayrollAnomalies(payrollData: any): Promise<PayrollAnomaly[]> {
    const anomalies: PayrollAnomaly[] = [];

    // Check for unusual salary changes
    if (payrollData.previousSalary && payrollData.salary !== payrollData.previousSalary) {
      const changePercent = Math.abs((payrollData.salary - payrollData.previousSalary) / payrollData.previousSalary * 100);
      if (changePercent > 20) {
        anomalies.push({
          type: 'significant_salary_change',
          description: `Salary changed by ${changePercent.toFixed(2)}%`,
          severity: 'high',
          recommendation: 'Review salary change documentation'
        });
      }
    }

    // Check for missing deductions
    if (!payrollData.deductions || payrollData.deductions.length === 0) {
      anomalies.push({
        type: 'missing_deductions',
        description: 'No deductions found in payroll',
        severity: 'medium',
        recommendation: 'Verify if employee should have deductions'
      });
    }

    return anomalies;
  }

  private async validateBusinessRules(bookingData: any): Promise<BusinessRuleResult> {
    // Mock implementation - would validate actual business rules
    return {
      isCompliant: true,
      violatedRules: [],
      ruleDetails: {
        pricingValid: true,
        availabilityValid: true,
        customerEligible: true
      }
    };
  }

  private async validateRevenueCalculation(bookingData: any): Promise<RevenueValidationResult> {
    // Mock implementation - would validate revenue calculations
    return {
      isValid: true,
      expectedRevenue: bookingData.price || 0,
      actualRevenue: bookingData.price || 0,
      variance: 0,
      validationDetails: {
        pricingCorrect: true,
        discountsApplied: bookingData.discounts || [],
        taxesCalculated: true
      }
    };
  }

  private async detectBookingAnomalies(bookingData: any): Promise<BookingAnomaly[]> {
    const anomalies: BookingAnomaly[] = [];

    // Check for same-day bookings
    const bookingDate = new Date(bookingData.startTime);
    const today = new Date();
    if (bookingDate.toDateString() === today.toDateString()) {
      anomalies.push({
        type: 'same_day_booking',
        description: 'Booking made for same day',
        severity: 'low',
        recommendation: 'Verify if this is intentional'
      });
    }

    return anomalies;
  }

  private async validateStockLevels(inventoryData: any): Promise<StockValidationResult> {
    // Mock implementation - would validate actual stock levels
    return {
      isValid: true,
      currentStock: inventoryData.currentStock || 0,
      minimumStock: inventoryData.minimumStock || 0,
      maximumStock: inventoryData.maximumStock || 0,
      stockStatus: 'optimal',
      validationDetails: {
        stockLevelValid: true,
        reorderPointValid: true,
        noStockouts: true
      }
    };
  }

  private async analyzeCostImplications(inventoryData: any): Promise<CostAnalysisResult> {
    // Mock implementation - would analyze actual cost implications
    return {
      totalCost: (inventoryData.quantity || 0) * (inventoryData.unitCost || 0),
      averageCost: inventoryData.unitCost || 0,
      costVariance: 0,
      costTrend: 'stable',
      analysisDetails: {
        costWithinRange: true,
        noUnusualIncreases: true,
        supplierCostsReasonable: true
      }
    };
  }

  private async detectInventoryAnomalies(inventoryData: any): Promise<InventoryAnomaly[]> {
    const anomalies: InventoryAnomaly[] = [];

    // Check for negative inventory
    if (inventoryData.quantity < 0) {
      anomalies.push({
        type: 'negative_inventory',
        description: 'Inventory quantity is negative',
        severity: 'critical',
        recommendation: 'Investigate inventory accounting error'
      });
    }

    return anomalies;
  }

  private generateFindings(validation: ValidationResult, compliance: ComplianceCheck[], risk: RiskAssessment): Finding[] {
    const findings: Finding[] = [];

    // Add validation findings
    validation.errors.forEach(error => {
      findings.push({
        type: 'validation_error',
        description: error.message,
        severity: error.severity,
        category: error.category,
        recommendation: error.suggestion || 'Review and correct the error'
      });
    });

    // Add compliance findings
    compliance.filter(c => c.status !== 'compliant').forEach(check => {
      findings.push({
        type: 'compliance_issue',
        description: `Compliance issue: ${check.name}`,
        severity: 'high',
        category: 'compliance',
        recommendation: `Address compliance requirements for ${check.name}`
      });
    });

    // Add risk findings
    risk.riskFactors.filter(f => f.riskLevel === 'high' || f.riskLevel === 'critical').forEach(factor => {
      findings.push({
        type: 'risk_factor',
        description: factor.description,
        severity: factor.riskLevel,
        category: 'risk',
        recommendation: factor.recommendation || 'Implement risk mitigation measures'
      });
    });

    return findings;
  }

  private generateRecommendations(transaction: FinancialTransaction, validation: ValidationResult, risk: RiskAssessment): string[] {
    const recommendations: string[] = [];

    if (!validation.isValid) {
      recommendations.push('Address validation errors before processing');
    }

    if (risk.overallRisk === 'high' || risk.overallRisk === 'critical') {
      recommendations.push('Implement additional security measures for high-risk transactions');
      recommendations.push('Consider requiring additional approvals');
    }

    if (transaction.amount > 50000) {
      recommendations.push('Large transactions should be reviewed by senior management');
    }

    return recommendations;
  }

  private determineComplianceStatus(complianceChecks: ComplianceCheck[]): ComplianceStatus {
    const nonCompliant = complianceChecks.filter(c => c.status !== 'compliant');
    
    if (nonCompliant.length === 0) {
      return 'compliant';
    } else if (nonCompliant.length === complianceChecks.length) {
      return 'non_compliant';
    } else {
      return 'pending_review';
    }
  }

  private async getRecentTransactionCount(accountId: string, hours: number): Promise<number> {
    // Mock implementation - would query actual transaction data
    return Math.floor(Math.random() * 20);
  }

  private getRiskScore(riskLevel: RiskLevel): number {
    switch (riskLevel) {
      case 'critical': return 1.0;
      case 'high': return 0.75;
      case 'medium': return 0.5;
      case 'low': return 0.25;
      default: return 0;
    }
  }

  private generateRiskRecommendations(riskFactors: RiskFactor[]): string[] {
    return riskFactors.map(factor => factor.recommendation || `Address ${factor.factor} risk factor`);
  }

  private generateReportId(): string {
    return `audit_rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Additional private methods for specific report generation
  private async generatePayrollAuditReport(payrollData: any, validation: ValidationResult, compliance: ComplianceCheck[], tax: TaxComplianceResult, anomalies: PayrollAnomaly[]): Promise<AuditReport> {
    // Mock implementation
    return {
      id: this.generateReportId(),
      transactionId: payrollData.id,
      transactionType: TransactionType.PAYROLL,
      timestamp: new Date(),
      validationResult: validation,
      complianceChecks: compliance,
      riskAssessment: { overallRisk: 'low', riskFactors: [], riskScore: 0, recommendations: [] },
      auditorId: 'system',
      status: 'approved',
      findings: [],
      recommendations: []
    };
  }

  private async generateBookingAuditReport(bookingData: any, validation: ValidationResult, businessRules: BusinessRuleResult, revenue: RevenueValidationResult, anomalies: BookingAnomaly[]): Promise<AuditReport> {
    // Mock implementation
    return {
      id: this.generateReportId(),
      transactionId: bookingData.id,
      transactionType: TransactionType.BOOKING,
      timestamp: new Date(),
      validationResult: validation,
      complianceChecks: [],
      riskAssessment: { overallRisk: 'low', riskFactors: [], riskScore: 0, recommendations: [] },
      auditorId: 'system',
      status: 'approved',
      findings: [],
      recommendations: []
    };
  }

  private async generateInventoryAuditReport(inventoryData: any, validation: ValidationResult, stock: StockValidationResult, cost: CostAnalysisResult, anomalies: InventoryAnomaly[]): Promise<AuditReport> {
    // Mock implementation
    return {
      id: this.generateReportId(),
      transactionId: inventoryData.id,
      transactionType: TransactionType.INVENTORY,
      timestamp: new Date(),
      validationResult: validation,
      complianceChecks: [],
      riskAssessment: { overallRisk: 'low', riskFactors: [], riskScore: 0, recommendations: [] },
      auditorId: 'system',
      status: 'approved',
      findings: [],
      recommendations: []
    };
  }

  private async generateBatchAuditReport(transactions: FinancialTransaction[], results: any[]): Promise<BatchAuditReport> {
    // Mock implementation
    return {
      id: this.generateReportId(),
      timestamp: new Date(),
      totalTransactions: transactions.length,
      validTransactions: results.filter(r => r.isValid).length,
      invalidTransactions: results.filter(r => !r.isValid).length,
      highRiskTransactions: 0,
      complianceScore: 100,
      summary: 'Batch audit completed successfully'
    };
  }

  private generateBatchRecommendations(results: any[]): string[] {
    const recommendations: string[] = [];
    
    const invalidCount = results.filter(r => !r.isValid).length;
    if (invalidCount > 0) {
      recommendations.push(`Review and fix ${invalidCount} invalid transactions`);
    }

    const highRiskCount = results.filter(r => r.riskAssessment.overallRisk === 'high' || r.riskAssessment.overallRisk === 'critical').length;
    if (highRiskCount > 0) {
      recommendations.push(`Implement additional controls for ${highRiskCount} high-risk transactions`);
    }

    return recommendations;
  }

  private identifyComplianceIssues(compliance: ComplianceCheck[], tax: TaxComplianceResult): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    
    compliance.filter(c => c.status !== 'compliant').forEach(check => {
      issues.push({
        id: check.id,
        description: `Compliance issue: ${check.name}`,
        severity: 'high',
        framework: 'Payroll Compliance',
        recommendation: `Address requirements for ${check.name}`
      });
    });

    if (!tax.federalTaxValid) {
      issues.push({
        id: 'tax_federal',
        description: 'Federal tax calculation is invalid',
        severity: 'critical',
        framework: 'IRS Compliance',
        recommendation: 'Review federal tax calculation parameters'
      });
    }

    return issues;
  }

  private generatePayrollRecommendations(payrollData: any, validation: ValidationResult, anomalies: PayrollAnomaly[]): string[] {
    const recommendations: string[] = [];

    if (!validation.isValid) {
      recommendations.push('Address payroll validation errors');
    }

    anomalies.forEach(anomaly => {
      recommendations.push(anomaly.recommendation);
    });

    return recommendations;
  }

  private generateBookingRecommendations(bookingData: any, validation: ValidationResult, anomalies: BookingAnomaly[]): string[] {
    const recommendations: string[] = [];

    if (!validation.isValid) {
      recommendations.push('Address booking validation errors');
    }

    anomalies.forEach(anomaly => {
      recommendations.push(anomaly.recommendation);
    });

    return recommendations;
  }

  private generateInventoryRecommendations(inventoryData: any, validation: ValidationResult, anomalies: InventoryAnomaly[]): string[] {
    const recommendations: string[] = [];

    if (!validation.isValid) {
      recommendations.push('Address inventory validation errors');
    }

    anomalies.forEach(anomaly => {
      recommendations.push(anomaly.recommendation);
    });

    return recommendations;
  }
}

// Supporting interfaces
interface AuditReport {
  id: string;
  transactionId: string;
  transactionType: TransactionType;
  timestamp: Date;
  validationResult: ValidationResult;
  complianceChecks: ComplianceCheck[];
  riskAssessment: RiskAssessment;
  auditorId: string;
  status: string;
  findings: Finding[];
  recommendations: string[];
}

interface RiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  riskScore: number;
  recommendations: string[];
}

interface RiskFactor {
  factor: string;
  description: string;
  riskLevel: RiskLevel;
  weight: number;
  recommendation?: string;
}

interface Finding {
  type: string;
  description: string;
  severity: string;
  category: string;
  recommendation: string;
}

interface ComplianceStatus {
  status: 'compliant' | 'non_compliant' | 'pending_review';
  score: number;
  issues: string[];
}

interface TaxComplianceResult {
  federalTaxValid: boolean;
  stateTaxValid: boolean;
  localTaxValid: boolean;
  ficaValid: boolean;
  totalTaxAmount: number;
  validationDetails: {
    federalCalculation: string;
    stateCalculation: string;
    ficaCalculation: string;
  };
}

interface PayrollAnomaly {
  type: string;
  description: string;
  severity: string;
  recommendation: string;
}

interface BusinessRuleResult {
  isCompliant: boolean;
  violatedRules: string[];
  ruleDetails: {
    pricingValid: boolean;
    availabilityValid: boolean;
    customerEligible: boolean;
  };
}

interface RevenueValidationResult {
  isValid: boolean;
  expectedRevenue: number;
  actualRevenue: number;
  variance: number;
  validationDetails: {
    pricingCorrect: boolean;
    discountsApplied: any[];
    taxesCalculated: boolean;
  };
}

interface BookingAnomaly {
  type: string;
  description: string;
  severity: string;
  recommendation: string;
}

interface StockValidationResult {
  isValid: boolean;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  stockStatus: string;
  validationDetails: {
    stockLevelValid: boolean;
    reorderPointValid: boolean;
    noStockouts: boolean;
  };
}

interface CostAnalysisResult {
  totalCost: number;
  averageCost: number;
  costVariance: number;
  costTrend: string;
  analysisDetails: {
    costWithinRange: boolean;
    noUnusualIncreases: boolean;
    supplierCostsReasonable: boolean;
  };
}

interface InventoryAnomaly {
  type: string;
  description: string;
  severity: string;
  recommendation: string;
}

interface BatchAuditReport {
  id: string;
  timestamp: Date;
  totalTransactions: number;
  validTransactions: number;
  invalidTransactions: number;
  highRiskTransactions: number;
  complianceScore: number;
  summary: string;
}

interface ComplianceIssue {
  id: string;
  description: string;
  severity: string;
  framework: string;
  recommendation: string;
}

interface FinancialSummary {
  totalTransactions: number;
  totalValue: number;
  compliantTransactions: number;
  highRiskTransactions: number;
}

interface ComplianceMetrics {
  overallScore: number;
  soxCompliance: number;
  pciCompliance: number;
  amlCompliance: number;
}

interface RiskMetrics {
  overallRiskLevel: string;
  riskDistribution: Record<string, number>;
  emergingRisks: string[];
}

interface TrendAnalysis {
  transactionVolume: any[];
  complianceTrend: any[];
  riskTrend: any[];
}

interface AuditAlert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: Date;
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
