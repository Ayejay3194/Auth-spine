/**
 * Type definitions for Governance & Drift Control Layer
 */

export interface ProductIntent {
  intentId: string;
  feature: string;
  for: string; // user type
  solves: string;
  doesNotSolve: string;
  misuse: string[];
  success: string;
  failure: string;
  owner: string;
  createdAt: Date;
  reviewedAt?: Date;
  approvedBy?: string;
  status: 'draft' | 'review' | 'approved' | 'deprecated';
}

export interface DriftSignal {
  id: string;
  type: 'quality' | 'culture' | 'trust' | 'performance' | 'usage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  baselineValue: number;
  driftPercentage: number;
  threshold: number;
  detectedAt: Date;
  acknowledged: boolean;
  resolved: boolean;
  actionRequired: boolean;
  recommendedActions: string[];
}

export interface ContinuityMetric {
  id: string;
  name: string;
  description: string;
  category: 'quality' | 'performance' | 'reliability' | 'security' | 'usability';
  currentValue: number;
  targetValue: number;
  tolerance: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
  lastMeasured: Date;
  history: Array<{
    timestamp: Date;
    value: number;
  }>;
}

export interface CultureIndicator {
  id: string;
  name: string;
  description: string;
  category: 'collaboration' | 'innovation' | 'quality' | 'trust' | 'learning';
  currentValue: number;
  targetValue: number;
  measurement: string;
  status: 'positive' | 'neutral' | 'negative';
  trend: 'improving' | 'stable' | 'declining';
  lastAssessed: Date;
  actions: string[];
}

export interface PowerBalance {
  id: string;
  name: string;
  description: string;
  type: 'decision' | 'resource' | 'information' | 'influence';
  balance: number; // -1 to 1, where 0 is balanced
  participants: Array<{
    role: string;
    influence: number;
    count: number;
  }>;
  health: 'balanced' | 'skewed' | 'concentrated';
  lastAnalyzed: Date;
  recommendations: string[];
}

export interface GovernanceConfig {
  enableIntentValidation: boolean;
  enableDriftDetection: boolean;
  enableContinuityMonitoring: boolean;
  enableCulturePreservation: boolean;
  enablePowerBalancing: boolean;
  driftThreshold: number;
  reviewInterval: number;
  alertThreshold: number;
  autoCorrection: boolean;
  governanceLayers: string[];
}

export interface DriftAssessment {
  overallScore: number;
  driftLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  signals: DriftSignal[];
  continuityMetrics: ContinuityMetric[];
  cultureIndicators: CultureIndicator[];
  powerBalances: PowerBalance[];
  recommendations: string[];
  nextReview: Date;
}

export interface IntentValidation {
  intentId: string;
  featureName: string;
  validationStatus: 'valid' | 'invalid' | 'partial';
  issues: Array<{
    type: 'missing' | 'unclear' | 'conflicting' | 'unmeasurable';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  approved: boolean;
  reviewedBy: string;
  reviewedAt: Date;
}

export interface GovernanceAlert {
  id: string;
  type: 'drift' | 'continuity' | 'culture' | 'power' | 'intent';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  assignedTo?: string;
  dueDate?: Date;
}
