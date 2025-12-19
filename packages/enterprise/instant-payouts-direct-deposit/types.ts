/**
 * Type definitions for Instant Payouts Direct Deposit
 */

export interface InstantPayoutsConfig {
  payouts: PayoutConfig;
  directDeposit: DirectDepositConfig;
  compliance: ComplianceConfig;
  reliability: ReliabilityConfig;
}

export interface PayoutConfig {
  enabled: boolean;
  processing: boolean;
  validation: boolean;
  scheduling: boolean;
  tracking: boolean;
}

export interface DirectDepositConfig {
  enabled: boolean;
  verification: boolean;
  routing: boolean;
  settlement: boolean;
  reconciliation: boolean;
}

export interface ComplianceConfig {
  enabled: boolean;
  monitoring: boolean;
  reporting: boolean;
  riskAssessment: boolean;
  auditTrail: boolean;
}

export interface ReliabilityConfig {
  enabled: boolean;
  monitoring: boolean;
  failover: boolean;
  scaling: boolean;
  performance: boolean;
}

export interface InstantPayoutsMetrics {
  payouts: PayoutMetrics;
  directDeposit: DirectDepositMetrics;
  compliance: ComplianceMetrics;
  reliability: ReliabilityMetrics;
  overall: {
    totalProcessed: number;
    successRate: number;
    averageProcessingTime: number;
    complianceScore: number;
  };
}

export interface PayoutMetrics {
  totalPayouts: number;
  successfulPayouts: number;
  failedPayouts: number;
  averageAmount: number;
  processingTime: number;
  queueLength: number;
}

export interface DirectDepositMetrics {
  accountsVerified: number;
  depositsProcessed: number;
  settlementTime: number;
  reconciliationAccuracy: number;
  routingSuccess: number;
}

export interface ComplianceMetrics {
  riskAssessments: number;
  alertsTriggered: number;
  auditLogs: number;
  complianceScore: number;
  violations: number;
}

export interface ReliabilityMetrics {
  uptime: number;
  failoverEvents: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

export interface PayoutProcessing {
  transactions: PayoutTransaction[];
  batches: PayoutBatch[];
  validation: ValidationRule[];
  scheduling: PayoutSchedule[];
  tracking: PayoutTracking[];
}

export interface PayoutTransaction {
  id: string;
  payoutId: string;
  recipientId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  method: 'direct_deposit' | 'wire' | 'ach' | 'check';
  accountInfo: AccountInfo;
  metadata: TransactionMetadata;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
}

export interface AccountInfo {
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  accountHolderName: string;
  verified: boolean;
  verificationDate?: Date;
  lastUsed?: Date;
}

export interface TransactionMetadata {
  reference: string;
  description: string;
  category: string;
  tags: string[];
  customFields: Record<string, any>;
  source: string;
  destination: string;
}

export interface PayoutBatch {
  id: string;
  name: string;
  transactions: string[];
  status: 'draft' | 'submitted' | 'processing' | 'completed' | 'failed';
  totalAmount: number;
  currency: string;
  transactionCount: number;
  submittedAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  createdBy: string;
  approvedBy?: string;
  scheduledFor?: Date;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: 'amount' | 'account' | 'recipient' | 'frequency' | 'custom';
  condition: string;
  action: 'approve' | 'reject' | 'hold' | 'flag';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  description: string;
}

export interface PayoutSchedule {
  id: string;
  name: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  amount: number;
  currency: string;
  nextRun: Date;
  lastRun?: Date;
  active: boolean;
  conditions: ScheduleCondition[];
  metadata: ScheduleMetadata;
}

export interface ScheduleCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
  value: any;
}

export interface ScheduleMetadata {
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: Date;
}

export interface PayoutTracking {
  transactionId: string;
  events: TrackingEvent[];
  status: TransactionStatus;
  estimatedCompletion?: Date;
  notifications: Notification[];
}

export interface TrackingEvent {
  id: string;
  type: 'created' | 'validated' | 'submitted' | 'processed' | 'completed' | 'failed';
  timestamp: Date;
  description: string;
  details: Record<string, any>;
  source: string;
}

export interface TransactionStatus {
  current: string;
  previous: string;
  progress: number;
  estimatedTimeRemaining?: number;
  nextMilestone?: string;
}

export interface Notification {
  id: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  recipient: string;
  message: string;
  sentAt: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface DirectDeposit {
  accounts: DepositAccount[];
  verification: AccountVerification[];
  routing: RoutingValidation[];
  settlement: SettlementProcess[];
  reconciliation: ReconciliationReport[];
}

export interface DepositAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  accountHolderName: string;
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  verified: boolean;
  verificationDate?: Date;
  lastUsed?: Date;
  balance?: number;
  limits: AccountLimits;
  metadata: AccountMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountLimits {
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
}

export interface AccountMetadata {
  tags: string[];
  notes: string;
  riskLevel: 'low' | 'medium' | 'high';
  complianceFlags: string[];
  customFields: Record<string, any>;
}

export interface AccountVerification {
  id: string;
  accountId: string;
  method: 'micro_deposits' | 'instant' | 'manual' | 'third_party';
  status: 'pending' | 'verified' | 'failed' | 'expired';
  attempts: number;
  maxAttempts: number;
  initiatedAt: Date;
  completedAt?: Date;
  details: VerificationDetails;
}

export interface VerificationDetails {
  microDeposits?: MicroDepositInfo;
  instant?: InstantVerificationInfo;
  manual?: ManualVerificationInfo;
  thirdParty?: ThirdPartyVerificationInfo;
}

export interface MicroDepositInfo {
  amounts: number[];
  depositedAt: Date;
  confirmedAt?: Date;
}

export interface InstantVerificationInfo {
  provider: string;
  verifiedAt: Date;
  confidence: number;
}

export interface ManualVerificationInfo {
  documents: string[];
  reviewedBy: string;
  reviewedAt: Date;
  notes: string;
}

export interface ThirdPartyVerificationInfo {
  provider: string;
  responseCode: string;
  verifiedAt: Date;
  details: Record<string, any>;
}

export interface RoutingValidation {
  routingNumber: string;
  bankName: string;
  address: BankAddress;
  status: 'valid' | 'invalid' | 'restricted';
  supported: boolean;
  restrictions: string[];
  validatedAt: Date;
}

export interface BankAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface SettlementProcess {
  id: string;
  batchId: string;
  transactions: string[];
  status: 'initiated' | 'processing' | 'completed' | 'failed';
  initiatedAt: Date;
  completedAt?: Date;
  settlementDate: Date;
  totalAmount: number;
  currency: string;
  fees: SettlementFees;
  reference: string;
}

export interface SettlementFees {
  processing: number;
  network: number;
  gateway: number;
  total: number;
}

export interface ReconciliationReport {
  id: string;
  date: Date;
  period: string;
  transactions: ReconciliationItem[];
  discrepancies: Discrepancy[];
  summary: ReconciliationSummary;
  status: 'in_progress' | 'completed' | 'failed';
  generatedAt: Date;
}

export interface ReconciliationItem {
  transactionId: string;
  expectedAmount: number;
  actualAmount: number;
  status: 'matched' | 'unmatched' | 'partial';
  difference: number;
  reason?: string;
}

export interface Discrepancy {
  id: string;
  type: 'amount' | 'timing' | 'fees' | 'missing';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedTransactions: string[];
  resolution?: string;
  resolvedAt?: Date;
}

export interface ReconciliationSummary {
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  totalDiscrepancies: number;
  totalAmount: number;
  matchedAmount: number;
  unmatchedAmount: number;
}

export interface ComplianceMonitoring {
  riskAssessments: RiskAssessment[];
  alerts: ComplianceAlert[];
  reports: ComplianceReport[];
  auditTrail: AuditEntry[];
  policies: CompliancePolicy[];
}

export interface RiskAssessment {
  id: string;
  transactionId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendation: string;
  assessedAt: Date;
  assessedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'review_required';
}

export interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
  threshold: number;
}

export interface ComplianceAlert {
  id: string;
  type: 'aml' | 'kyc' | 'sanctions' | 'fraud' | 'limit' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  entityId: string;
  entityType: 'transaction' | 'account' | 'recipient';
  triggeredAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  details: AlertDetails;
}

export interface AlertDetails {
  rule: string;
  conditions: string[];
  evidence: string[];
  recommendations: string[];
}

export interface ComplianceReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'ad_hoc';
  period: string;
  generatedAt: Date;
  data: ReportData;
  summary: ReportSummary;
  status: 'draft' | 'review' | 'approved' | 'submitted';
}

export interface ReportData {
  transactions: number;
  amount: number;
  alerts: number;
  violations: number;
  riskScores: RiskScoreData[];
  trends: TrendData[];
}

export interface RiskScoreData {
  date: string;
  averageScore: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface TrendData {
  metric: string;
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ReportSummary {
  overallRisk: 'low' | 'medium' | 'high';
  complianceScore: number;
  keyFindings: string[];
  recommendations: string[];
  actionItems: string[];
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'error';
}

export interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  rules: PolicyRule[];
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
  updatedBy: string;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: 'monitor' | 'block' | 'flag' | 'escalate';
  threshold: number;
  description: string;
}

export interface ReliabilityEngine {
  monitoring: SystemMonitoring;
  failover: FailoverSystem;
  scaling: AutoScaling;
  performance: PerformanceMetrics;
  health: HealthStatus;
}

export interface SystemMonitoring {
  metrics: SystemMetric[];
  alerts: SystemAlert[];
  dashboards: MonitoringDashboard[];
  uptime: UptimeReport[];
}

export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  threshold: MetricThreshold;
  status: 'normal' | 'warning' | 'critical';
}

export interface MetricThreshold {
  warning: number;
  critical: number;
  operator: 'gt' | 'lt' | 'eq';
}

export interface SystemAlert {
  id: string;
  type: 'performance' | 'availability' | 'capacity' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  component: string;
  triggeredAt: Date;
  acknowledged: boolean;
  resolved: boolean;
  details: AlertDetails;
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  refreshRate: number;
  lastUpdated: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'alert';
  title: string;
  query: string;
  config: Record<string, any>;
}

export interface UptimeReport {
  period: string;
  uptime: number;
  downtime: number;
  incidents: Incident[];
  availability: number;
}

export interface Incident {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  impact: string;
  resolved: boolean;
}

export interface FailoverSystem {
  primary: PrimarySystem;
  secondary: SecondarySystem[];
  failoverPolicy: FailoverPolicy;
  status: FailoverStatus;
}

export interface PrimarySystem {
  name: string;
  status: 'active' | 'inactive' | 'failed';
  lastHeartbeat: Date;
  performance: SystemPerformance;
}

export interface SecondarySystem {
  name: string;
  status: 'standby' | 'active' | 'failed';
  ready: boolean;
  lastSync: Date;
  performance: SystemPerformance;
}

export interface SystemPerformance {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
}

export interface FailoverPolicy {
  automatic: boolean;
  conditions: FailoverCondition[];
  delay: number;
  rollbackPolicy: RollbackPolicy;
}

export interface FailoverCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  threshold: number;
  duration: number;
}

export interface RollbackPolicy {
  automatic: boolean;
  conditions: RollbackCondition[];
  delay: number;
}

export interface RollbackCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  threshold: number;
  duration: number;
}

export interface FailoverStatus {
  current: string;
  lastFailover?: Date;
  failoverCount: number;
  totalDowntime: number;
}

export interface AutoScaling {
  policies: ScalingPolicy[];
  metrics: ScalingMetrics;
  history: ScalingEvent[];
  currentCapacity: CurrentCapacity;
}

export interface ScalingPolicy {
  id: string;
  name: string;
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  enabled: boolean;
}

export interface ScalingMetrics {
  currentLoad: number;
  targetLoad: number;
  utilization: number;
  queueLength: number;
  responseTime: number;
}

export interface ScalingEvent {
  id: string;
  type: 'scale_up' | 'scale_down';
  timestamp: Date;
  fromInstances: number;
  toInstances: number;
  reason: string;
  duration: number;
}

export interface CurrentCapacity {
  instances: number;
  cpu: number;
  memory: number;
  throughput: number;
  activeConnections: number;
}

export interface PerformanceMetrics {
  throughput: ThroughputMetric[];
  latency: LatencyMetric[];
  errors: ErrorMetric[];
  resources: ResourceMetric[];
}

export interface ThroughputMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  period: string;
}

export interface LatencyMetric {
  name: string;
  value: number;
  unit: string;
  percentile: number;
  timestamp: Date;
}

export interface ErrorMetric {
  type: string;
  count: number;
  rate: number;
  timestamp: Date;
  period: string;
}

export interface ResourceMetric {
  resource: string;
  utilized: number;
  total: number;
  percentage: number;
  timestamp: Date;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: ComponentHealth[];
  lastCheck: Date;
  uptime: number;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  lastCheck: Date;
  metrics: HealthMetric[];
}

export interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
}
