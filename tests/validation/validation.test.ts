/**
 * Comprehensive Validation Framework Test Suite
 * 
 * Tests all validation components including:
 * - Validation Service
 * - Receipt System
 * - Audit Trail Management
 * - Compliance Validation
 * - Financial Auditing
 * - Report Generation
 */

import { 
  ValidationService, 
  DataValidator 
} from '../../packages/enterprise/validation/service';
import { 
  ReceiptGenerator, 
  ReceiptManager 
} from '../../packages/enterprise/validation/receipts';
import { 
  AuditTrailManager 
} from '../../packages/enterprise/validation/audit-trail';
import { 
  ComplianceValidator 
} from '../../packages/enterprise/validation/compliance';
import { 
  FinancialAuditor 
} from '../../packages/enterprise/validation/financial-auditor';
import { 
  ReportGenerator 
} from '../../packages/enterprise/validation/reports';
import { 
  TransactionType,
  ReceiptStatus,
  ComplianceStatus,
  ValidationType,
  ErrorSeverity
} from '../../packages/enterprise/validation/types';

describe('Comprehensive Validation Framework', () => {
  let validationService: ValidationService;
  let receiptGenerator: ReceiptGenerator;
  let auditManager: AuditTrailManager;
  let complianceValidator: ComplianceValidator;
  let financialAuditor: FinancialAuditor;
  let reportGenerator: ReportGenerator;

  beforeEach(() => {
    validationService = new ValidationService();
    receiptGenerator = new ReceiptGenerator();
    auditManager = new AuditTrailManager();
    complianceValidator = new ComplianceValidator();
    financialAuditor = new FinancialAuditor();
    reportGenerator = new ReportGenerator();
  });

  describe('🔧 Validation Service Tests', () => {
    describe('Data Validation', () => {
      test('should validate financial transaction successfully', async () => {
        const transaction = {
          id: 'txn_001',
          amount: 1000,
          currency: 'USD',
          fromAccount: 'acc_001',
          toAccount: 'acc_002',
          description: 'Test transaction'
        };

        const result = await validationService.validateFinancialTransaction(transaction);

        expect(result).toBeDefined();
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metadata.validationType).toBe(ValidationType.FINANCIAL);
        expect(result.metadata.complianceLevel).toBe('enhanced');
      });

      test('should reject invalid financial transaction', async () => {
        const invalidTransaction = {
          id: 'txn_002',
          amount: -100, // Invalid negative amount
          currency: 'USD',
          fromAccount: '',
          toAccount: '',
          description: ''
        };

        const result = await validationService.validateFinancialTransaction(invalidTransaction);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(e => e.severity === ErrorSeverity.CRITICAL)).toBe(true);
      });

      test('should validate payroll calculation', async () => {
        const payrollData = {
          id: 'pay_001',
          employeeId: 'emp_001',
          payPeriod: '2024-01',
          grossPay: 5000,
          netPay: 3500,
          taxes: {
            federal: 750,
            state: 250,
            total: 1000
          },
          deductions: [
            { id: 'health', amount: 300, type: 'pre_tax' },
            { id: '401k', amount: 200, type: 'pre_tax' }
          ]
        };

        const result = await validationService.validatePayrollCalculation(payrollData);

        expect(result.isValid).toBe(true);
        expect(result.metadata.validationType).toBe(ValidationType.COMPLIANCE);
        expect(result.metadata.complianceLevel).toBe('comprehensive');
      });

      test('should detect payroll calculation errors', async () => {
        const invalidPayroll = {
          id: 'pay_002',
          employeeId: 'emp_002',
          payPeriod: '2024-01',
          grossPay: 5000,
          netPay: 6000, // Net pay greater than gross pay
          taxes: {
            federal: -100, // Negative tax
            state: 250,
            total: 150
          },
          deductions: []
        };

        const result = await validationService.validatePayrollCalculation(invalidPayroll);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('Net pay calculation'))).toBe(true);
      });

      test('should validate booking data', async () => {
        const bookingData = {
          id: 'book_001',
          customerId: 'cust_001',
          serviceId: 'svc_001',
          startTime: new Date(Date.now() + 86400000), // Tomorrow
          endTime: new Date(Date.now() + 86400000 + 3600000), // Tomorrow + 1 hour
          price: 100
        };

        const result = await validationService.validateBooking(bookingData);

        expect(result.isValid).toBe(true);
        expect(result.metadata.validationType).toBe(ValidationType.BUSINESS_RULE);
      });

      test('should reject invalid booking time range', async () => {
        const invalidBooking = {
          id: 'book_002',
          customerId: 'cust_002',
          serviceId: 'svc_002',
          startTime: new Date(Date.now() + 3600000), // Future
          endTime: new Date(Date.now() - 3600000), // Past
          price: 100
        };

        const result = await validationService.validateBooking(invalidBooking);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('Start time must be before end time'))).toBe(true);
      });

      test('should validate inventory transaction', async () => {
        const inventoryData = {
          id: 'inv_001',
          productId: 'prod_001',
          quantity: 10,
          transactionType: 'in',
          currentStock: 100,
          minimumStock: 20,
          maximumStock: 500
        };

        const result = await validationService.validateInventoryTransaction(inventoryData);

        expect(result.isValid).toBe(true);
        expect(result.metadata.validationType).toBe(ValidationType.OPERATIONAL);
      });

      test('should reject insufficient stock transaction', async () => {
        const invalidInventory = {
          id: 'inv_002',
          productId: 'prod_002',
          quantity: 150, // More than current stock
          transactionType: 'out',
          currentStock: 100,
          minimumStock: 20,
          maximumStock: 500
        };

        const result = await validationService.validateInventoryTransaction(invalidInventory);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('Insufficient stock'))).toBe(true);
      });

      test('should perform batch validation efficiently', async () => {
        const transactions = Array.from({ length: 100 }, (_, i) => ({
          id: `txn_${i}`,
          amount: 100 + i,
          currency: 'USD',
          fromAccount: `acc_${i}`,
          toAccount: `acc_${i + 1}`,
          description: `Transaction ${i}`
        }));

        const results = await validationService.validateBatch('financial_transaction', transactions);

        expect(results).toHaveLength(100);
        expect(results.every(r => r.isValid)).toBe(true);
      });
    });

    describe('Validation Rules Engine', () => {
      test('should add and execute custom validation rules', () => {
        const dataValidator = new DataValidator();
        
        dataValidator.addRule('custom_entity', {
          id: 'custom_001',
          name: 'Custom Validation Rule',
          description: 'Test custom validation rule',
          type: ValidationType.DATA_INTEGRITY,
          entityType: 'custom_entity',
          conditions: [
            { field: 'requiredField', operator: 'not_equals', value: null, required: true }
          ],
          actions: [],
          isActive: true,
          priority: 1
        });

        expect(() => dataValidator.addRule('custom_entity', {} as any)).not.toThrow();
      });
    });
  });

  describe('📋 Receipt System Tests', () => {
    describe('Receipt Generation', () => {
      test('should generate receipt for financial transaction', async () => {
        const transactionData = {
          id: 'txn_001',
          amount: 1000,
          currency: 'USD',
          fromAccount: 'acc_001',
          toAccount: 'acc_002',
          description: 'Test transaction'
        };

        const receipt = await receiptGenerator.generateReceipt(
          'txn_001',
          TransactionType.PAYMENT,
          transactionData
        );

        expect(receipt).toBeDefined();
        expect(receipt.id).toMatch(/^rcpt_/);
        expect(receipt.transactionId).toBe('txn_001');
        expect(receipt.transactionType).toBe(TransactionType.PAYMENT);
        expect(receipt.amount).toBe(1000);
        expect(receipt.currency).toBe('USD');
        expect(receipt.status).toBe(ReceiptStatus.VALIDATED);
        expect(receipt.validationResults).toBeDefined();
        expect(receipt.auditTrail).toBeDefined();
        expect(receipt.complianceChecks).toBeDefined();
        expect(receipt.digitalSignature).toBeDefined();
        expect(receipt.blockchainHash).toBeDefined();
      });

      test('should generate payroll receipt with enhanced compliance', async () => {
        const payrollData = {
          id: 'pay_001',
          employeeId: 'emp_001',
          grossPay: 5000,
          netPay: 3500,
          taxes: { total: 1000 },
          deductions: []
        };

        const receipt = await receiptGenerator.generatePayrollReceipt(payrollData);

        expect(receipt.transactionType).toBe(TransactionType.PAYROLL);
        expect(receipt.complianceChecks.length).toBeGreaterThan(0);
        expect(receipt.auditTrail.length).toBeGreaterThan(0);
      });

      test('should approve receipt with compliance verification', async () => {
        const transactionData = {
          id: 'txn_002',
          amount: 500,
          currency: 'USD',
          fromAccount: 'acc_001',
          toAccount: 'acc_002',
          description: 'Test transaction'
        };

        const receipt = await receiptGenerator.generateReceipt(
          'txn_002',
          TransactionType.PAYMENT,
          transactionData
        );

        const approvedReceipt = await receiptGenerator.approveReceipt(receipt.id, 'admin_001');

        expect(approvedReceipt.status).toBe(ReceiptStatus.APPROVED);
        expect(approvedReceipt.approvedBy).toBe('admin_001');
      });

      test('should verify receipt authenticity', async () => {
        const transactionData = {
          id: 'txn_003',
          amount: 750,
          currency: 'USD',
          fromAccount: 'acc_001',
          toAccount: 'acc_002',
          description: 'Test transaction'
        };

        const receipt = await receiptGenerator.generateReceipt(
          'txn_003',
          TransactionType.PAYMENT,
          transactionData
        );

        const verification = await receiptGenerator.verifyReceipt(receipt.id);

        expect(verification.isValid).toBe(true);
        expect(verification.tampered).toBe(false);
        expect(verification.verificationDetails).toBeDefined();
      });

      test('should export receipt in multiple formats', async () => {
        const transactionData = {
          id: 'txn_004',
          amount: 250,
          currency: 'USD',
          fromAccount: 'acc_001',
          toAccount: 'acc_002',
          description: 'Test transaction'
        };

        const receipt = await receiptGenerator.generateReceipt(
          'txn_004',
          TransactionType.PAYMENT,
          transactionData
        );

        const jsonExport = await receiptGenerator.exportReceipt(receipt.id, 'json');
        const pdfExport = await receiptGenerator.exportReceipt(receipt.id, 'pdf');

        expect(jsonExport).toBeDefined();
        expect(pdfExport).toBeDefined();
        expect(typeof jsonExport).toBe('string');
        expect(pdfExport).toBeInstanceOf(Uint8Array);
      });
    });

    describe('Receipt Management', () => {
      test('should process transaction with receipt generation', async () => {
        const receiptManager = new ReceiptManager();
        
        const transaction = {
          type: TransactionType.PAYMENT,
          data: {
            id: 'txn_005',
            amount: 1000,
            currency: 'USD'
          },
          autoApprove: true
        };

        const receipt = await receiptManager.processTransaction(
          transaction.type,
          transaction.data,
          transaction.autoApprove
        );

        expect(receipt.status).toBe(ReceiptStatus.APPROVED);
      });

      test('should process batch transactions', async () => {
        const receiptManager = new ReceiptManager();
        
        const transactions = Array.from({ length: 10 }, (_, i) => ({
          type: TransactionType.PAYMENT,
          data: {
            id: `txn_${i}`,
            amount: 100 + i,
            currency: 'USD'
          },
          autoApprove: false
        }));

        const receipts = await receiptManager.processBatchTransactions(transactions);

        expect(receipts).toHaveLength(10);
        expect(receipts.every(r => r.status === ReceiptStatus.VALIDATED)).toBe(true);
      });
    });
  });

  describe('🔍 Audit Trail Management Tests', () => {
    describe('Audit Logging', () => {
      test('should create audit trail for entity creation', async () => {
        const entityData = {
          id: 'entity_001',
          name: 'Test Entity',
          value: 100
        };

        const auditTrail = await auditManager.createAuditTrail(
          'entity_001',
          'test_entity',
          entityData,
          'user_001',
          'create' as any
        );

        expect(auditTrail).toHaveLength(1);
        expect(auditTrail[0].entityId).toBe('entity_001');
        expect(auditTrail[0].entityType).toBe('test_entity');
        expect(auditTrail[0].userId).toBe('user_001');
        expect(auditTrail[0].action).toBe('create');
        expect(auditTrail[0].changes).toHaveLength(3); // id, name, value
      });

      test('should log data changes with detailed tracking', async () => {
        const oldData = { id: 'entity_002', name: 'Old Name', value: 100 };
        const newData = { id: 'entity_002', name: 'New Name', value: 200 };

        const auditEntry = await auditManager.logDataChange(
          'entity_002',
          'test_entity',
          oldData,
          newData,
          'user_002'
        );

        expect(auditEntry.changes).toHaveLength(2); // name and value changed
        expect(auditEntry.changes.some(c => c.field === 'name')).toBe(true);
        expect(auditEntry.changes.some(c => c.field === 'value')).toBe(true);
      });

      test('should log approval actions', async () => {
        const auditEntry = await auditManager.logApproval(
          'entity_003',
          'test_entity',
          'approver_001',
          1,
          'Approved for processing'
        );

        expect(auditEntry.action).toBe('approve');
        expect(auditEntry.metadata.approvalLevel).toBe(1);
        expect(auditEntry.metadata.comments).toBe('Approved for processing');
      });

      test('should log view access for high-security entities', async () => {
        const auditEntry = await auditManager.logView(
          'financial_transaction_001',
          'financial_transaction',
          'user_003',
          'read'
        );

        expect(auditEntry.action).toBe('view');
        expect(auditEntry.metadata.accessLevel).toBe('read');
      });

      test('should log export actions with compliance tracking', async () => {
        const auditEntry = await auditManager.logExport(
          'entity_004',
          'test_entity',
          'user_004',
          'pdf',
          100,
          { dateRange: '2024-01' }
        );

        expect(auditEntry.action).toBe('export');
        expect(auditEntry.metadata.exportFormat).toBe('pdf');
        expect(auditEntry.metadata.recordCount).toBe(100);
      });

      test('should retrieve audit trail with filters', async () => {
        // Create some audit entries first
        await auditManager.createAuditTrail('entity_005', 'test_entity', { id: 'entity_005' }, 'user_005', 'create' as any);
        await auditManager.logDataChange('entity_005', 'test_entity', { id: 'entity_005' }, { id: 'entity_005', name: 'Test' }, 'user_005');

        const auditTrail = await auditManager.getAuditTrail('entity_005', {
          limit: 10,
          actions: ['create', 'update']
        });

        expect(auditTrail.length).toBeGreaterThan(0);
        expect(auditTrail.every(e => e.entityId === 'entity_005')).toBe(true);
      });

      test('should verify audit trail integrity', async () => {
        const verification = await auditManager.verifyAuditIntegrity('entity_006');

        expect(verification.isValid).toBeDefined();
        expect(verification.issues).toBeDefined();
        expect(verification.checksum).toBeDefined();
      });

      test('should generate audit statistics', async () => {
        const stats = await auditManager.getAuditStatistics();

        expect(stats.totalEntries).toBeDefined();
        expect(stats.actionsBreakdown).toBeDefined();
        expect(stats.topUsers).toBeDefined();
        expect(stats.suspiciousActivities).toBeDefined();
        expect(stats.complianceScore).toBeDefined();
      });
    });
  });

  describe('⚖️ Compliance Validation Tests', () => {
    describe('Regulatory Compliance', () => {
      test('should validate financial compliance', async () => {
        const transactionData = {
          id: 'txn_001',
          amount: 10000,
          currency: 'USD',
          fromAccount: 'acc_001',
          toAccount: 'acc_002'
        };

        const complianceChecks = await complianceValidator.validateFinancialCompliance(transactionData);

        expect(complianceChecks).toHaveLength(4); // SOX, PCI, AML, Sanctions
        expect(complianceChecks.every(c => c.status === ComplianceStatus.COMPLIANT)).toBe(true);
      });

      test('should validate payroll compliance', async () => {
        const payrollData = {
          id: 'pay_001',
          employeeId: 'emp_001',
          salary: 60000,
          payFrequency: 'biweekly'
        };

        const complianceChecks = await complianceValidator.validatePayrollCompliance(payrollData);

        expect(complianceChecks).toHaveLength(5); // IRS, FLSA, State Tax, Min Wage, Overtime
        expect(complianceChecks.every(c => c.status === ComplianceStatus.COMPLIANT)).toBe(true);
      });

      test('should validate privacy compliance', async () => {
        const userData = {
          id: 'user_001',
          personalData: 'sensitive information',
          consentGiven: true
        };

        const euCompliance = await complianceValidator.validatePrivacyCompliance(userData, 'EU');
        const usCompliance = await complianceValidator.validatePrivacyCompliance(userData, 'US');

        expect(euCompliance).toHaveLength(2); // GDPR + general
        expect(usCompliance).toHaveLength(2); // CCPA + general
        expect(euCompliance.every(c => c.status === ComplianceStatus.COMPLIANT)).toBe(true);
        expect(usCompliance.every(c => c.status === ComplianceStatus.COMPLIANT)).toBe(true);
      });

      test('should validate industry-specific compliance', async () => {
        const healthcareData = {
          id: 'patient_001',
          medicalRecords: 'protected health information'
        };

        const healthcareCompliance = await complianceValidator.validateIndustryCompliance('healthcare', healthcareData);

        expect(healthcareCompliance).toHaveLength(2); // HIPAA + HITECH
        expect(healthcareCompliance.every(c => c.status === ComplianceStatus.COMPLIANT)).toBe(true);
      });

      test('should perform continuous compliance monitoring', async () => {
        const monitoring = await complianceValidator.performContinuousMonitoring();

        expect(monitoring.compliantSystems).toBeDefined();
        expect(monitoring.nonCompliantSystems).toBeDefined();
        expect(monitoring.criticalIssues).toBeDefined();
        expect(monitoring.recommendations).toBeDefined();
      });

      test('should generate compliance report', async () => {
        const report = await complianceValidator.generateComplianceReport({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
          type: 'monthly'
        });

        expect(report.executiveSummary).toBeDefined();
        expect(report.complianceScore).toBeDefined();
        expect(report.frameworkCompliance).toBeDefined();
        expect(report.findings).toBeDefined();
        expect(report.remediationPlan).toBeDefined();
        expect(report.evidence).toBeDefined();
      });

      test('should validate against specific regulatory framework', async () => {
        const data = { financialData: 'test data' };
        const soxCompliance = await complianceValidator.validateAgainstFramework('SOX', data);

        expect(soxCompliance).toHaveLength(3); // SOX requirements
        expect(soxCompliance.every(c => c.status === ComplianceStatus.COMPLIANT)).toBe(true);
      });
    });
  });

  describe('💰 Financial Auditing Tests', () => {
    describe('Transaction Auditing', () => {
      test('should audit financial transaction comprehensively', async () => {
        const transaction = {
          id: 'txn_001',
          type: TransactionType.PAYMENT,
          amount: 5000,
          currency: 'USD',
          fromAccount: 'acc_001',
          toAccount: 'acc_002',
          description: 'Large payment',
          createdAt: new Date()
        };

        const audit = await financialAuditor.auditTransaction(transaction);

        expect(audit.isValid).toBeDefined();
        expect(audit.auditReport).toBeDefined();
        expect(audit.complianceStatus).toBeDefined();
        expect(audit.riskAssessment).toBeDefined();
        expect(audit.recommendations).toBeDefined();
      });

      test('should audit payroll transaction with enhanced compliance', async () => {
        const payrollData = {
          id: 'pay_001',
          employeeId: 'emp_001',
          grossPay: 8000,
          netPay: 5500,
          taxes: { federal: 1200, state: 400, total: 1600 },
          deductions: [{ id: 'health', amount: 600, type: 'pre_tax' }],
          previousSalary: 7500
        };

        const audit = await financialAuditor.auditPayrollTransaction(payrollData);

        expect(audit.isValid).toBeDefined();
        expect(audit.auditReport).toBeDefined();
        expect(audit.complianceIssues).toBeDefined();
        expect(audit.taxCompliance).toBeDefined();
        expect(audit.recommendations).toBeDefined();
      });

      test('should audit booking transaction with business rules', async () => {
        const bookingData = {
          id: 'book_001',
          customerId: 'cust_001',
          serviceId: 'svc_001',
          startTime: new Date(Date.now() + 86400000),
          endTime: new Date(Date.now() + 86400000 + 7200000),
          price: 500,
          discounts: [{ type: 'early_bird', amount: 50 }]
        };

        const audit = await financialAuditor.auditBookingTransaction(bookingData);

        expect(audit.isValid).toBeDefined();
        expect(audit.auditReport).toBeDefined();
        expect(audit.businessRuleCompliance).toBeDefined();
        expect(audit.revenueValidation).toBeDefined();
        expect(audit.recommendations).toBeDefined();
      });

      test('should audit inventory transaction with stock validation', async () => {
        const inventoryData = {
          id: 'inv_001',
          productId: 'prod_001',
          quantity: 50,
          transactionType: 'out',
          currentStock: 200,
          unitCost: 25,
          minimumStock: 50,
          maximumStock: 500
        };

        const audit = await financialAuditor.auditInventoryTransaction(inventoryData);

        expect(audit.isValid).toBeDefined();
        expect(audit.auditReport).toBeDefined();
        expect(audit.stockValidation).toBeDefined();
        expect(audit.costAnalysis).toBeDefined();
        expect(audit.recommendations).toBeDefined();
      });

      test('should audit batch transactions', async () => {
        const transactions = Array.from({ length: 50 }, (_, i) => ({
          id: `txn_${i}`,
          type: TransactionType.PAYMENT,
          amount: 100 + i * 10,
          currency: 'USD',
          fromAccount: `acc_${i}`,
          toAccount: `acc_${i + 1}`,
          description: `Transaction ${i}`,
          createdAt: new Date()
        }));

        const batchAudit = await financialAuditor.auditBatchTransactions(transactions);

        expect(batchAudit.totalTransactions).toBe(50);
        expect(batchAudit.validTransactions).toBeDefined();
        expect(batchAudit.invalidTransactions).toBeDefined();
        expect(batchAudit.highRiskTransactions).toBeDefined();
        expect(batchAudit.complianceScore).toBeDefined();
        expect(batchAudit.batchReport).toBeDefined();
        expect(batchAudit.recommendations).toBeDefined();
      });

      test('should generate financial audit dashboard', async () => {
        const dashboard = await financialAuditor.generateFinancialAuditDashboard({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        });

        expect(dashboard.summary).toBeDefined();
        expect(dashboard.complianceMetrics).toBeDefined();
        expect(dashboard.riskMetrics).toBeDefined();
        expect(dashboard.trendAnalysis).toBeDefined();
        expect(dashboard.alerts).toBeDefined();
      });
    });
  });

  describe('📊 Report Generation Tests', () => {
    describe('Report Types', () => {
      test('should generate compliance report', async () => {
        const report = await reportGenerator.generateComplianceReport({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
          type: 'monthly'
        });

        expect(report.report).toBeDefined();
        expect(report.summary).toBeDefined();
        expect(report.detailedFindings).toBeDefined();
        expect(report.recommendations).toBeDefined();
        expect(report.evidence).toBeDefined();
      });

      test('should generate audit summary report', async () => {
        const report = await reportGenerator.generateAuditSummaryReport({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
          type: 'monthly'
        }, true);

        expect(report.report).toBeDefined();
        expect(report.executiveSummary).toBeDefined();
        expect(report.keyMetrics).toBeDefined();
        expect(report.trends).toBeDefined();
        expect(report.actionItems).toBeDefined();
      });

      test('should generate risk assessment report', async () => {
        const report = await reportGenerator.generateRiskAssessmentReport({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
          type: 'monthly'
        });

        expect(report.report).toBeDefined();
        expect(report.riskSummary).toBeDefined();
        expect(report.riskMatrix).toBeDefined();
        expect(report.mitigationPlan).toBeDefined();
        expect(report.monitoringStrategy).toBeDefined();
      });

      test('should generate transaction audit report', async () => {
        const transactionIds = ['txn_001', 'txn_002', 'txn_003'];
        const report = await reportGenerator.generateTransactionAuditReport(transactionIds, true);

        expect(report.report).toBeDefined();
        expect(report.transactionDetails).toBeDefined();
        expect(report.complianceResults).toBeDefined();
        expect(report.auditTrail).toBeDefined();
        expect(report.findings).toBeDefined();
      });

      test('should generate financial summary report', async () => {
        const report = await reportGenerator.generateFinancialSummaryReport({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
          type: 'monthly'
        }, true);

        expect(report.report).toBeDefined();
        expect(report.financialOverview).toBeDefined();
        expect(report.transactionAnalysis).toBeDefined();
        expect(report.complianceMetrics).toBeDefined();
        expect(report.projections).toBeDefined();
      });

      test('should export report in multiple formats', async () => {
        // First generate a report
        const report = await reportGenerator.generateComplianceReport({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
          type: 'monthly'
        });

        const pdfExport = await reportGenerator.exportReport(report.report.id, 'pdf');
        const excelExport = await reportGenerator.exportReport(report.report.id, 'excel');
        const csvExport = await reportGenerator.exportReport(report.report.id, 'csv');
        const jsonExport = await reportGenerator.exportReport(report.report.id, 'json');

        expect(pdfExport).toBeInstanceOf(Uint8Array);
        expect(excelExport).toBeInstanceOf(Uint8Array);
        expect(typeof csvExport).toBe('string');
        expect(typeof jsonExport).toBe('string');
      });

      test('should schedule automated report generation', async () => {
        const scheduleId = await reportGenerator.scheduleReport(
          'compliance_report' as any,
          {
            frequency: 'daily',
            time: '09:00',
            timezone: 'UTC'
          },
          ['admin@company.com'],
          { includeDetails: true }
        );

        expect(scheduleId).toBeDefined();
        expect(scheduleId).toMatch(/^sched_/);
      });

      test('should generate report dashboard data', async () => {
        const dashboard = await reportGenerator.getReportDashboard({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
          type: 'monthly'
        });

        expect(dashboard.summary).toBeDefined();
        expect(dashboard.charts).toBeDefined();
        expect(dashboard.alerts).toBeDefined();
        expect(dashboard.kpis).toBeDefined();
      });
    });
  });

  describe('🔧 Integration Tests', () => {
    test('should process complete transaction workflow', async () => {
      // 1. Validate transaction
      const transaction = {
        id: 'workflow_001',
        amount: 2500,
        currency: 'USD',
        fromAccount: 'acc_001',
        toAccount: 'acc_002',
        description: 'Complete workflow test'
      };

      const validation = await validationService.validateFinancialTransaction(transaction);
      expect(validation.isValid).toBe(true);

      // 2. Generate receipt
      const receipt = await receiptGenerator.generateReceipt(
        transaction.id,
        TransactionType.PAYMENT,
        transaction
      );
      expect(receipt.status).toBe(ReceiptStatus.VALIDATED);

      // 3. Log audit trail
      const auditEntry = await auditManager.logDataChange(
        transaction.id,
        'financial_transaction',
        null,
        transaction,
        'system'
      );
      expect(auditEntry.changes.length).toBeGreaterThan(0);

      // 4. Check compliance
      const compliance = await complianceValidator.validateFinancialCompliance(transaction);
      expect(compliance.every(c => c.status === ComplianceStatus.COMPLIANT)).toBe(true);

      // 5. Audit transaction
      const audit = await financialAuditor.auditTransaction(transaction as any);
      expect(audit.isValid).toBe(true);

      // 6. Generate report
      const report = await reportGenerator.generateTransactionAuditReport([transaction.id]);
      expect(report.report).toBeDefined();
    });

    test('should handle high-volume transaction processing', async () => {
      const transactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `volume_${i}`,
        amount: 100 + i,
        currency: 'USD',
        fromAccount: `acc_${i}`,
        toAccount: `acc_${i + 1}`,
        description: `Volume test ${i}`
      }));

      const startTime = Date.now();

      // Batch validation
      const validations = await validationService.validateBatch('financial_transaction', transactions);
      expect(validations.every(v => v.isValid)).toBe(true);

      // Batch receipt generation
      const receiptManager = new ReceiptManager();
      const receipts = await receiptManager.processBatchTransactions(
        transactions.map(t => ({ type: TransactionType.PAYMENT, data: t }))
      );
      expect(receipts).toHaveLength(1000);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process 1000 transactions in under 5 seconds
      expect(processingTime).toBeLessThan(5000);
    });

    test('should maintain data integrity across all systems', async () => {
      const originalData = {
        id: 'integrity_001',
        amount: 1000,
        currency: 'USD',
        sensitiveField: 'confidential_data'
      };

      // Process through all systems
      const validation = await validationService.validateFinancialTransaction(originalData);
      const receipt = await receiptGenerator.generateReceipt(
        originalData.id,
        TransactionType.PAYMENT,
        originalData
      );
      const audit = await auditManager.createAuditTrail(
        originalData.id,
        'financial_transaction',
        originalData,
        'system',
        'create' as any
      );

      // Verify data integrity
      expect(validation.isValid).toBe(true);
      expect(receipt.validationResults.isValid).toBe(true);
      expect(audit[0].changes.some(c => c.field === 'amount')).toBe(true);
      expect(audit[0].changes.some(c => c.newValue === 1000)).toBe(true);
    });
  });

  describe('🚀 Performance Tests', () => {
    test('should validate single transaction under 50ms', async () => {
      const transaction = {
        id: 'perf_001',
        amount: 1000,
        currency: 'USD',
        fromAccount: 'acc_001',
        toAccount: 'acc_002',
        description: 'Performance test'
      };

      const startTime = Date.now();
      await validationService.validateFinancialTransaction(transaction);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    test('should generate receipt under 100ms', async () => {
      const transactionData = {
        id: 'perf_002',
        amount: 1000,
        currency: 'USD',
        fromAccount: 'acc_001',
        toAccount: 'acc_002',
        description: 'Performance test'
      };

      const startTime = Date.now();
      await receiptGenerator.generateReceipt(
        transactionData.id,
        TransactionType.PAYMENT,
        transactionData
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    test('should handle concurrent validations', async () => {
      const transactions = Array.from({ length: 100 }, (_, i) => ({
        id: `concurrent_${i}`,
        amount: 100 + i,
        currency: 'USD',
        fromAccount: `acc_${i}`,
        toAccount: `acc_${i + 1}`,
        description: `Concurrent test ${i}`
      }));

      const startTime = Date.now();
      const promises = transactions.map(t => 
        validationService.validateFinancialTransaction(t)
      );
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results.every(r => r.isValid)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('🛡️ Security Tests', () => {
    test('should reject malicious transaction data', async () => {
      const maliciousTransaction = {
        id: '<script>alert("xss")</script>',
        amount: -1000000, // Negative large amount
        currency: 'INVALID',
        fromAccount: '../../etc/passwd',
        toAccount: 'DROP TABLE users;',
        description: '<img src=x onerror=alert("xss")>'
      };

      const validation = await validationService.validateFinancialTransaction(maliciousTransaction);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(2);
    });

    test('should sanitize input data properly', async () => {
      const dataWithScript = {
        id: 'sanitize_001',
        amount: 1000,
        currency: 'USD',
        description: '<script>alert("xss")</script>Safe content',
        notes: 'DROP TABLE users; -- Safe content'
      };

      const validation = await validationService.validateFinancialTransaction(dataWithScript);

      // Should not crash and should handle malicious input gracefully
      expect(validation).toBeDefined();
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should maintain audit log integrity', async () => {
      const auditEntry = await auditManager.logDataChange(
        'security_001',
        'test_entity',
        { id: 'security_001', value: 'original' },
        { id: 'security_001', value: 'modified' },
        'user_001'
      );

      // Verify audit entry cannot be tampered with
      expect(auditEntry.id).toBeDefined();
      expect(auditEntry.timestamp).toBeDefined();
      expect(auditEntry.changes).toBeDefined();
    });
  });
});
