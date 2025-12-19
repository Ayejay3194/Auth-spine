/**
 * Type definitions for Financial Reporting Dashboard
 */

export interface FinancialReportingConfig {
  revenue: RevenueConfig;
  expenses: ExpenseConfig;
  planning: PlanningConfig;
  compliance: ComplianceConfig;
}

export interface RevenueConfig {
  enabled: boolean;
  analytics: boolean;
  forecasting: boolean;
  segmentation: boolean;
  reporting: boolean;
}

export interface ExpenseConfig {
  enabled: boolean;
  tracking: boolean;
  categorization: boolean;
  budgeting: boolean;
  optimization: boolean;
}

export interface PlanningConfig {
  enabled: boolean;
  budgeting: boolean;
  forecasting: boolean;
  scenarios: boolean;
  analysis: boolean;
}

export interface ComplianceConfig {
  enabled: boolean;
  reporting: boolean;
  audits: boolean;
  regulations: boolean;
  documentation: boolean;
}

export interface FinancialReportingMetrics {
  revenue: RevenueMetrics;
  expenses: ExpenseMetrics;
  planning: PlanningMetrics;
  compliance: ComplianceMetrics;
  overall: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
    growthRate: number;
  };
}

export interface RevenueMetrics {
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
  averageRevenuePerCustomer: number;
  revenueBySegment: Record<string, number>;
  forecastAccuracy: number;
}

export interface ExpenseMetrics {
  monthlyExpenses: number;
  yearlyExpenses: number;
  expenseGrowth: number;
  costOptimization: number;
  budgetVariance: number;
  expenseByCategory: Record<string, number>;
}

export interface PlanningMetrics {
  budgetUtilization: number;
  forecastAccuracy: number;
  scenarioAnalysis: number;
  planningEfficiency: number;
  riskAssessment: number;
}

export interface ComplianceMetrics {
  reportsGenerated: number;
  auditsCompleted: number;
  complianceScore: number;
  regulatoryAdherence: number;
  documentationComplete: number;
}

export interface RevenueAnalytics {
  revenueStreams: RevenueStream[];
  customerSegments: CustomerSegment[];
  revenueTrends: RevenueTrend[];
  forecasts: RevenueForecast[];
  kpis: RevenueKPI[];
}

export interface RevenueStream {
  id: string;
  name: string;
  type: 'recurring' | 'one-time' | 'usage-based' | 'tiered';
  description: string;
  currentRevenue: number;
  projectedRevenue: number;
  growthRate: number;
  contribution: number;
  customers: number;
  averageRevenuePerCustomer: number;
  churnRate: number;
  trends: RevenueTrend[];
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  revenue: number;
  averageRevenue: number;
  growthRate: number;
  characteristics: string[];
  acquisitionCost: number;
  lifetimeValue: number;
  churnRate: number;
}

export interface RevenueTrend {
  period: string;
  revenue: number;
  growth: number;
  customers: number;
  averageRevenue: number;
  forecast: number;
  variance: number;
}

export interface RevenueForecast {
  id: string;
  name: string;
  period: string;
  methodology: 'historical' | 'regression' | 'ml' | 'hybrid';
  confidence: number;
  projectedRevenue: number;
  bestCase: number;
  worstCase: number;
  factors: ForecastFactor[];
  accuracy: number;
}

export interface ForecastFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface RevenueKPI {
  id: string;
  name: string;
  description: string;
  current: number;
  target: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'off-track';
  calculation: string;
}

export interface ExpenseTracking {
  categories: ExpenseCategory[];
  expenses: Expense[];
  budgets: Budget[];
  optimizations: ExpenseOptimization[];
  alerts: ExpenseAlert[];
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: 'fixed' | 'variable' | 'semi-variable';
  description: string;
  budget: number;
  actual: number;
  variance: number;
  percentage: number;
  trends: ExpenseTrend[];
}

export interface Expense {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: Date;
  vendor: string;
  type: 'operational' | 'capital' | 'administrative';
  status: 'approved' | 'pending' | 'rejected';
  approver?: string;
  tags: string[];
  attachments: string[];
}

export interface ExpenseTrend {
  period: string;
  amount: number;
  budget: number;
  variance: number;
  percentage: number;
  count: number;
}

export interface Budget {
  id: string;
  name: string;
  period: string;
  total: number;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
  status: 'active' | 'completed' | 'exceeded';
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  categoryId: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
  variance: number;
}

export interface ExpenseOptimization {
  id: string;
  title: string;
  description: string;
  category: string;
  potentialSavings: number;
  implementationCost: number;
  roi: number;
  priority: 'low' | 'medium' | 'high';
  status: 'identified' | 'in-progress' | 'completed';
  timeline: string;
  owner: string;
}

export interface ExpenseAlert {
  id: string;
  type: 'budget-exceeded' | 'unusual-spike' | 'vendor-issue' | 'approval-required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  amount?: number;
  threshold?: number;
  date: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export interface FinancialPlanning {
  budgets: Budget[];
  forecasts: FinancialForecast[];
  scenarios: PlanningScenario[];
  analysis: PlanningAnalysis[];
  recommendations: PlanningRecommendation[];
}

export interface FinancialForecast {
  id: string;
  name: string;
  type: 'revenue' | 'expense' | 'cash-flow' | 'profit';
  period: string;
  methodology: string;
  assumptions: ForecastAssumption[];
  projections: ForecastProjection[];
  confidence: number;
  accuracy: number;
  lastUpdated: Date;
}

export interface ForecastAssumption {
  name: string;
  value: number;
  description: string;
  source: string;
  sensitivity: 'low' | 'medium' | 'high';
}

export interface ForecastProjection {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  cashFlow: number;
  confidence: number;
}

export interface PlanningScenario {
  id: string;
  name: string;
  description: string;
  type: 'optimistic' | 'realistic' | 'pessimistic' | 'custom';
  assumptions: ScenarioAssumption[];
  outcomes: ScenarioOutcome[];
  probability: number;
  impact: 'low' | 'medium' | 'high';
}

export interface ScenarioAssumption {
  parameter: string;
  value: number;
  baseline: number;
  change: number;
  rationale: string;
}

export interface ScenarioOutcome {
  metric: string;
  value: number;
  baseline: number;
  change: number;
  changePercent: number;
}

export interface PlanningAnalysis {
  id: string;
  name: string;
  type: 'variance' | 'trend' | 'ratio' | 'benchmark';
  description: string;
  methodology: string;
  results: AnalysisResult[];
  insights: string[];
  recommendations: string[];
  date: Date;
}

export interface AnalysisResult {
  metric: string;
  value: number;
  target: number;
  variance: number;
  status: 'favorable' | 'unfavorable' | 'neutral';
  trend: 'improving' | 'declining' | 'stable';
}

export interface PlanningRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'revenue' | 'expense' | 'investment' | 'risk';
  priority: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  owner: string;
  status: 'proposed' | 'approved' | 'in-progress' | 'completed';
}

export interface ComplianceReporting {
  frameworks: ComplianceFramework[];
  reports: ComplianceReport[];
  audits: ComplianceAudit[];
  evidence: ComplianceEvidence[];
  alerts: ComplianceAlert[];
}

export interface ComplianceFramework {
  id: string;
  name: string;
  type: 'gaap' | 'ifrs' | 'sox' | 'tax' | 'custom';
  version: string;
  requirements: ComplianceRequirement[];
  status: 'active' | 'inactive' | 'archived';
  lastUpdated: Date;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  dueDate: Date;
  status: 'compliant' | 'non-compliant' | 'pending';
  evidence: string[];
  owner: string;
}

export interface ComplianceReport {
  id: string;
  name: string;
  type: 'financial' | 'regulatory' | 'audit' | 'tax';
  framework: string;
  period: string;
  status: 'draft' | 'review' | 'approved' | 'submitted';
  content: ReportContent;
  attachments: string[];
  generated: Date;
  submitted?: Date;
}

export interface ReportContent {
  summary: string;
  sections: ReportSection[];
  findings: ReportFinding[];
  recommendations: string[];
  signatures: ReportSignature[];
}

export interface ReportSection {
  title: string;
  content: string;
  data: any[];
  charts: ChartDefinition[];
}

export interface ReportFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendation: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface ReportSignature {
  name: string;
  title: string;
  date: Date;
  signature: string;
}

export interface ChartDefinition {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: any[];
  config: Record<string, any>;
}

export interface ComplianceAudit {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'regulatory';
  scope: string[];
  startDate: Date;
  endDate?: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'follow-up';
  findings: AuditFinding[];
  score: number;
  recommendations: string[];
}

export interface AuditFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface ComplianceEvidence {
  id: string;
  requirementId: string;
  type: 'document' | 'transaction' | 'system' | 'testimony';
  description: string;
  fileUrl?: string;
  metadata: Record<string, any>;
  collected: Date;
  verified: boolean;
  retention: Date;
}

export interface ComplianceAlert {
  id: string;
  type: 'deadline' | 'non-compliance' | 'audit' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  dueDate?: Date;
  requirementId?: string;
  date: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
}
