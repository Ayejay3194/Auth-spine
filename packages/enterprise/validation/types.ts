/**
 * Validation System Type Definitions
 * 
 * Comprehensive type definitions for the enterprise validation and auditing system
 * with strict typing for maximum type safety and compliance.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: ValidationMetadata;
  timestamp: Date;
  validatedBy: string;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  fixable: boolean;
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  category: WarningCategory;
  recommendation?: string;
}

export interface ValidationMetadata {
  validationType: ValidationType;
  businessContext: string;
  complianceLevel: ComplianceLevel;
  auditRequired: boolean;
  autoCorrectable: boolean;
}

export interface Receipt {
  id: string;
  transactionId: string;
  transactionType: TransactionType;
  businessEntity: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: ReceiptStatus;
  validationResults: ValidationResult;
  auditTrail: AuditEntry[];
  complianceChecks: ComplianceCheck[];
  generatedBy: string;
  approvedBy?: string;
  digitalSignature: string;
  blockchainHash?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes: DataChange[];
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export interface DataChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: ChangeType;
}

export interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  status: ComplianceStatus;
  requirements: string[];
  evidence: ComplianceEvidence[];
  checkedAt: Date;
  checkedBy: string;
  nextReviewDate: Date;
}

export interface ComplianceEvidence {
  type: EvidenceType;
  description: string;
  source: string;
  timestamp: Date;
  verified: boolean;
}

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  fromAccount: string;
  toAccount: string;
  description: string;
  category: TransactionCategory;
  status: TransactionStatus;
  approvals: TransactionApproval[];
  auditTrail: AuditEntry[];
  complianceChecks: ComplianceCheck[];
  createdAt: Date;
  processedAt?: Date;
}

export interface TransactionApproval {
  id: string;
  approverId: string;
  approverRole: string;
  status: ApprovalStatus;
  timestamp: Date;
  comments?: string;
  level: number;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: ValidationType;
  entityType: string;
  conditions: ValidationCondition[];
  actions: ValidationAction[];
  isActive: boolean;
  priority: number;
}

export interface ValidationCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  required: boolean;
}

export interface ValidationAction {
  type: ActionType;
  parameters: Record<string, any>;
  executeOnError: boolean;
}

export interface AuditReport {
  id: string;
  title: string;
  type: ReportType;
  period: ReportPeriod;
  data: AuditReportData;
  generatedAt: Date;
  generatedBy: string;
  format: ReportFormat;
  complianceLevel: ComplianceLevel;
}

export interface AuditReportData {
  totalTransactions: number;
  validatedTransactions: number;
  failedValidations: number;
  complianceScore: number;
  riskAssessment: RiskAssessment;
  recommendations: string[];
  exceptions: AuditException[];
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  categories: RiskCategory[];
  highRiskItems: RiskItem[];
  mitigations: RiskMitigation[];
}

export interface RiskCategory {
  category: string;
  riskLevel: RiskLevel;
  factors: string[];
  impact: string;
}

export interface RiskItem {
  id: string;
  description: string;
  riskLevel: RiskLevel;
  category: string;
  likelihood: number;
  impact: number;
  mitigation?: string;
}

export interface RiskMitigation {
  riskId: string;
  strategy: string;
  timeline: string;
  responsible: string;
  status: MitigationStatus;
}

export interface AuditException {
  id: string;
  description: string;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  approvedBy: string;
  approvedAt: Date;
  reason: string;
  resolution?: string;
}

export enum ValidationType {
  DATA_INTEGRITY = 'data_integrity',
  BUSINESS_RULE = 'business_rule',
  COMPLIANCE = 'compliance',
  FINANCIAL = 'financial',
  SECURITY = 'security',
  OPERATIONAL = 'operational'
}

export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ErrorCategory {
  DATA_VALIDATION = 'data_validation',
  BUSINESS_LOGIC = 'business_logic',
  COMPLIANCE = 'compliance',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

export enum WarningCategory {
  BEST_PRACTICE = 'best_practice',
  OPTIMIZATION = 'optimization',
  DEPRECATION = 'deprecation',
  CONFIGURATION = 'configuration'
}

export enum ComplianceLevel {
  NONE = 'none',
  BASIC = 'basic',
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  COMPREHENSIVE = 'comprehensive'
}

export enum TransactionType {
  PAYROLL = 'payroll',
  INVOICE = 'invoice',
  PAYMENT = 'payment',
  REFUND = 'refund',
  EXPENSE = 'expense',
  INVENTORY = 'inventory',
  BOOKING = 'booking',
  SUBSCRIPTION = 'subscription'
}

export enum ReceiptStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  VIEW = 'view',
  EXPORT = 'export'
}

export enum ChangeType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING_REVIEW = 'pending_review',
  EXEMPT = 'exempt'
}

export enum EvidenceType {
  DOCUMENT = 'document',
  SYSTEM_LOG = 'system_log',
  USER_TESTIMONY = 'user_testimony',
  AUTOMATED_CHECK = 'automated_check',
  THIRD_PARTY = 'third_party'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum TransactionCategory {
  OPERATIONAL = 'operational',
  CAPITAL = 'capital',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
  ASSET = 'asset',
  LIABILITY = 'liability'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  REGEX = 'regex',
  IN = 'in',
  NOT_IN = 'not_in'
}

export enum ActionType {
  LOG_ERROR = 'log_error',
  SEND_NOTIFICATION = 'send_notification',
  BLOCK_TRANSACTION = 'block_transaction',
  REQUIRE_APPROVAL = 'require_approval',
  AUTO_CORRECT = 'auto_correct',
  ESCALATE = 'escalate'
}

export enum ReportType {
  COMPLIANCE_REPORT = 'compliance_report',
  AUDIT_SUMMARY = 'audit_summary',
  RISK_ASSESSMENT = 'risk_assessment',
  TRANSACTION_AUDIT = 'transaction_audit',
  FINANCIAL_SUMMARY = 'financial_summary'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  HTML = 'html'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MitigationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue'
}

export enum ExceptionCategory {
  BUSINESS_JUSTIFICATION = 'business_justification',
  TECHNICAL_LIMITATION = 'technical_limitation',
  REGULATORY_EXEMPTION = 'regulatory_exemption',
  TEMPORARY_WAIVER = 'temporary_waiver'
}

export enum ExceptionSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

// Additional types for validation settings
export interface ValidationSettings {
  enableStrictValidation: boolean;
  autoCorrectMinorErrors: boolean;
  requireApprovalForHighRisk: boolean;
  maxRetryAttempts: number;
  validationTimeout: number;
  enableParallelValidation: boolean;
  cacheValidationResults: boolean;
  cacheExpiry: number;
  enableRealTimeValidation: boolean;
  validationBatchSize: number;
}

export interface ComplianceSettings {
  enableContinuousMonitoring: boolean;
  complianceCheckFrequency: string;
  autoGenerateReports: boolean;
  reportRetentionPeriod: number;
  enableAutomatedRemediation: boolean;
  requireEvidenceForCompliance: boolean;
  enableJurisdictionChecks: boolean;
  defaultJurisdiction: string;
  enableIndustrySpecificChecks: boolean;
  complianceScoreThreshold: number;
}

export interface AuditSettings {
  enableDetailedLogging: boolean;
  logRetentionPeriod: number;
  enableImmutableLogs: boolean;
  logToExternalSystem: boolean;
  enableRealTimeAlerts: boolean;
  alertThresholds: {
    failedTransactions: number;
    complianceViolations: number;
    securityIncidents: number;
  };
  enableLogEncryption: boolean;
  enableLogSigning: boolean;
  enableLogBackup: boolean;
  backupFrequency: string;
}
