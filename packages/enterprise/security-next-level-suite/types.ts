/**
 * Type definitions for Security Next Level Suite
 */

export interface SecurityNextLevelConfig {
  compliance: NextLevelComplianceConfig;
  enforcement: NextLevelEnforcementConfig;
  dashboard: NextLevelDashboardConfig;
}

export interface NextLevelComplianceConfig {
  enabled: boolean;
  advancedFrameworks: boolean;
  continuousMonitoring: boolean;
  predictiveCompliance: boolean;
  automatedAuditing: boolean;
}

export interface NextLevelEnforcementConfig {
  enabled: boolean;
  intelligentControls: boolean;
  adaptivePolicies: boolean;
  realTimeResponse: boolean;
  automatedRemediation: boolean;
}

export interface NextLevelDashboardConfig {
  enabled: boolean;
  realTimeMetrics: boolean;
  threatVisualization: boolean;
  complianceReporting: boolean;
  executiveInsights: boolean;
}

export interface SecurityNextLevelMetrics {
  compliance: NextLevelComplianceMetrics;
  enforcement: NextLevelEnforcementMetrics;
  dashboard: NextLevelDashboardMetrics;
  overall: {
    securityScore: number;
    complianceRate: number;
    threatPrevention: number;
    operationalEfficiency: number;
  };
}

export interface NextLevelComplianceMetrics {
  frameworksActive: number;
  continuousChecks: number;
  predictionsAccurate: number;
  auditsAutomated: number;
  complianceScore: number;
}

export interface NextLevelEnforcementMetrics {
  intelligentControls: number;
  adaptivePolicies: number;
  realTimeResponses: number;
  automatedRemediations: number;
  enforcementRate: number;
}

export interface NextLevelDashboardMetrics {
  realTimeMetrics: number;
  threatsVisualized: number;
  reportsGenerated: number;
  insightsProvided: number;
  dashboardUsage: number;
}

export interface AdvancedComplianceFramework {
  id: string;
  name: string;
  type: 'regulatory' | 'industry' | 'custom';
  version: string;
  requirements: AdvancedRequirement[];
  controls: AdvancedControl[];
  monitoring: ComplianceMonitoring[];
  status: 'active' | 'inactive' | 'deprecated';
}

export interface AdvancedRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
  automated: boolean;
  monitored: boolean;
  evidence: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'not-applicable';
  lastAssessed: Date;
  nextAssessment: Date;
}

export interface AdvancedControl {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'preventive' | 'detective' | 'corrective' | 'adaptive';
  implemented: boolean;
  automated: boolean;
  intelligent: boolean;
  effectiveness: number;
  lastTested: Date;
  nextTest: Date;
  metrics: ControlMetrics;
}

export interface ControlMetrics {
  executionCount: number;
  successRate: number;
  averageResponseTime: number;
  falsePositiveRate: number;
  lastExecution: Date;
}

export interface ComplianceMonitoring {
  id: string;
  requirementId: string;
  controlId: string;
  type: 'continuous' | 'periodic' | 'event-driven';
  frequency: string;
  threshold: number;
  alerts: MonitoringAlert[];
  status: 'active' | 'inactive' | 'error';
}

export interface MonitoringAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

export interface IntelligentEnforcement {
  id: string;
  name: string;
  type: 'policy' | 'control' | 'response';
  description: string;
  intelligence: 'rule-based' | 'ml-based' | 'hybrid';
  adaptive: boolean;
  learning: boolean;
  effectiveness: number;
  lastUpdated: Date;
  metrics: EnforcementMetrics;
}

export interface EnforcementMetrics {
  executions: number;
  successRate: number;
  averageTime: number;
  adaptations: number;
  improvements: number;
}

export interface AdaptivePolicy {
  id: string;
  name: string;
  description: string;
  rules: AdaptiveRule[];
  learning: boolean;
  adaptationRate: number;
  effectiveness: number;
  lastAdapted: Date;
}

export interface AdaptiveRule {
  id: string;
  condition: string;
  action: string;
  weight: number;
  adaptive: boolean;
  performance: number;
  lastUpdated: Date;
}

export interface SecurityDashboard {
  id: string;
  name: string;
  type: 'executive' | 'operational' | 'technical';
  widgets: DashboardWidget[];
  realTime: boolean;
  refreshRate: number;
  customization: DashboardCustomization;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert';
  title: string;
  dataSource: string;
  configuration: any;
  position: WidgetPosition;
  visible: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardCustomization {
  theme: string;
  layout: string;
  filters: string[];
  alerts: AlertConfiguration[];
}

export interface AlertConfiguration {
  type: string;
  threshold: number;
  enabled: boolean;
  recipients: string[];
}

export interface ThreatVisualization {
  id: string;
  type: 'heatmap' | 'timeline' | 'network' | 'geographic';
  data: any;
  configuration: VisualizationConfig;
  realTime: boolean;
  interactive: boolean;
}

export interface VisualizationConfig {
  colors: string[];
  filters: string[];
  zoom: number;
  layers: string[];
}

export interface ExecutiveInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  metrics: InsightMetrics;
  recommendations: InsightRecommendation[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  generated: Date;
}

export interface InsightMetrics {
  current: number;
  trend: 'improving' | 'stable' | 'declining';
  target: number;
  variance: number;
}

export interface InsightRecommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  owner: string;
}
