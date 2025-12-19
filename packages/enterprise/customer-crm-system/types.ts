/**
 * Type definitions for Customer CRM System
 */

export interface CRMConfig {
  customers: CustomerConfig;
  sales: SalesConfig;
  marketing: MarketingConfig;
  support: SupportConfig;
}

export interface CustomerConfig {
  enabled: boolean;
  profiles: boolean;
  segmentation: boolean;
  lifecycle: boolean;
  analytics: boolean;
}

export interface SalesConfig {
  enabled: boolean;
  pipeline: boolean;
  automation: boolean;
  forecasting: boolean;
  reporting: boolean;
}

export interface MarketingConfig {
  enabled: boolean;
  campaigns: boolean;
  automation: boolean;
  analytics: boolean;
  personalization: boolean;
}

export interface SupportConfig {
  enabled: boolean;
  tickets: boolean;
  knowledge: boolean;
  automation: boolean;
  analytics: boolean;
}

export interface CRMMetrics {
  customers: CustomerMetrics;
  sales: SalesMetrics;
  marketing: MarketingMetrics;
  support: SupportMetrics;
  overall: {
    totalCustomers: number;
    customerSatisfaction: number;
    revenuePerCustomer: number;
    retentionRate: number;
  };
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  customerLifetimeValue: number;
  satisfactionScore: number;
}

export interface SalesMetrics {
  totalRevenue: number;
  dealsWon: number;
  dealsLost: number;
  conversionRate: number;
  averageDealSize: number;
  salesCycleLength: number;
}

export interface MarketingMetrics {
  campaignsActive: number;
  leadsGenerated: number;
  conversionRate: number;
  costPerLead: number;
  roi: number;
  engagementRate: number;
}

export interface SupportMetrics {
  ticketsOpen: number;
  ticketsClosed: number;
  responseTime: number;
  resolutionTime: number;
  customerSatisfaction: number;
  firstContactResolution: number;
}

export interface CustomerManagement {
  profiles: CustomerProfile[];
  segments: CustomerSegment[];
  lifecycle: CustomerLifecycle[];
  analytics: CustomerAnalytics[];
  interactions: CustomerInteraction[];
}

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  industry?: string;
  size?: string;
  location: Location;
  demographics: Demographics;
  preferences: CustomerPreferences;
  status: 'active' | 'inactive' | 'prospect' | 'churned';
  source: string;
  createdAt: Date;
  updatedAt: Date;
  lastContact: Date;
  tags: string[];
  customFields: Record<string, any>;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  timezone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Demographics {
  age?: number;
  gender?: string;
  education?: string;
  income?: string;
  family?: string;
  interests: string[];
}

export interface CustomerPreferences {
  communication: {
    email: boolean;
    sms: boolean;
    phone: boolean;
    mail: boolean;
  };
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  language: string;
  timezone: string;
  topics: string[];
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  customers: string[];
  size: number;
  value: number;
  growth: number;
  churnRisk: number;
  engagement: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCriteria {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
  weight: number;
}

export interface CustomerLifecycle {
  id: string;
  name: string;
  stages: LifecycleStage[];
  rules: LifecycleRule[];
  automation: LifecycleAutomation[];
  analytics: LifecycleAnalytics[];
}

export interface LifecycleStage {
  id: string;
  name: string;
  description: string;
  order: number;
  duration?: number;
  criteria: string[];
  actions: string[];
  kpis: string[];
}

export interface LifecycleRule {
  id: string;
  name: string;
  trigger: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: any;
}

export interface RuleAction {
  type: 'email' | 'task' | 'tag' | 'segment' | 'score';
  parameters: Record<string, any>;
}

export interface LifecycleAutomation {
  id: string;
  name: string;
  trigger: string;
  actions: AutomationAction[];
  enabled: boolean;
  performance: AutomationPerformance;
}

export interface AutomationAction {
  type: string;
  delay?: number;
  parameters: Record<string, any>;
}

export interface AutomationPerformance {
  executions: number;
  successRate: number;
  errors: number;
  lastRun: Date;
}

export interface LifecycleAnalytics {
  stage: string;
  customers: number;
  conversionRate: number;
  averageTime: number;
  dropOffRate: number;
  revenue: number;
}

export interface CustomerAnalytics {
  behavior: BehaviorAnalytics;
  engagement: EngagementAnalytics;
  value: ValueAnalytics;
  retention: RetentionAnalytics;
  prediction: PredictiveAnalytics;
}

export interface BehaviorAnalytics {
  pageViews: number;
  sessions: number;
  duration: number;
  bounceRate: number;
  paths: string[];
  events: TrackedEvent[];
}

export interface TrackedEvent {
  name: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  properties: Record<string, any>;
}

export interface EngagementAnalytics {
  score: number;
  frequency: number;
  recency: number;
  intensity: number;
  channels: ChannelEngagement[];
}

export interface ChannelEngagement {
  channel: string;
  opens: number;
  clicks: number;
  responses: number;
  lastActivity: Date;
}

export interface ValueAnalytics {
  totalValue: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  productAffinity: ProductAffinity[];
  profitability: number;
}

export interface ProductAffinity {
  productId: string;
  productName: string;
  score: number;
  purchases: number;
  revenue: number;
}

export interface RetentionAnalytics {
  retentionRate: number;
  churnRisk: number;
  predictedChurn: number;
  churnReasons: ChurnReason[];
  loyaltyScore: number;
}

export interface ChurnReason {
  reason: string;
  count: number;
  percentage: number;
  preventable: boolean;
}

export interface PredictiveAnalytics {
  churnProbability: number;
  upsellProbability: number;
  nextPurchaseDate: Date;
  lifetimeValue: number;
  recommendations: PredictionRecommendation[];
}

export interface PredictionRecommendation {
  type: 'retention' | 'upsell' | 'cross-sell' | 'engagement';
  priority: 'low' | 'medium' | 'high';
  action: string;
  confidence: number;
  expectedValue: number;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'email' | 'phone' | 'meeting' | 'support' | 'social' | 'web';
  channel: string;
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  timestamp: Date;
  duration?: number;
  outcome?: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface SalesAutomation {
  pipeline: SalesPipeline[];
  deals: SalesDeal[];
  automation: SalesAutomationRule[];
  forecasting: SalesForecast[];
  analytics: SalesAnalytics[];
}

export interface SalesPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  deals: string[];
  conversionRates: Record<string, number>;
  averageDurations: Record<string, number>;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  order: number;
  probability: number;
  duration: number;
  requirements: string[];
  automation: string[];
}

export interface SalesDeal {
  id: string;
  name: string;
  customerId: string;
  pipelineId: string;
  stageId: string;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  status: 'open' | 'won' | 'lost' | 'stalled';
  owner: string;
  source: string;
  products: DealProduct[];
  activities: DealActivity[];
  competitors: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface DealActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  description: string;
  timestamp: Date;
  duration?: number;
  outcome?: string;
  createdBy: string;
}

export interface SalesAutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: SalesCondition[];
  actions: SalesAction[];
  enabled: boolean;
  performance: AutomationPerformance;
}

export interface SalesCondition {
  field: string;
  operator: string;
  value: any;
}

export interface SalesAction {
  type: 'task' | 'email' | 'notification' | 'stage-change' | 'assignment';
  parameters: Record<string, any>;
}

export interface SalesForecast {
  id: string;
  name: string;
  period: string;
  methodology: string;
  confidence: number;
  projectedRevenue: number;
  bestCase: number;
  worstCase: number;
  deals: string[];
  assumptions: ForecastAssumption[];
  accuracy: number;
}

export interface ForecastAssumption {
  name: string;
  value: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SalesAnalytics {
  pipeline: PipelineAnalytics;
  performance: PerformanceAnalytics;
  productivity: ProductivityAnalytics;
  forecasting: ForecastingAnalytics;
}

export interface PipelineAnalytics {
  totalValue: number;
  dealCount: number;
  averageDealSize: number;
  conversionRate: number;
  cycleLength: number;
  byStage: Record<string, StageAnalytics>;
}

export interface StageAnalytics {
  value: number;
  deals: number;
  conversionRate: number;
  averageDuration: number;
}

export interface PerformanceAnalytics {
  revenue: number;
  target: number;
  attainment: number;
  growth: number;
  margin: number;
  byPeriod: Record<string, PeriodPerformance>;
}

export interface PeriodPerformance {
  revenue: number;
  target: number;
  attainment: number;
  growth: number;
}

export interface ProductivityAnalytics {
  activities: number;
  calls: number;
  emails: number;
  meetings: number;
  tasks: number;
  byRep: Record<string, RepProductivity>;
}

export interface RepProductivity {
  activities: number;
  calls: number;
  emails: number;
  meetings: number;
  tasks: number;
  deals: number;
  revenue: number;
}

export interface ForecastingAnalytics {
  accuracy: number;
  bias: number;
  variance: number;
  trend: string;
  seasonality: SeasonalityPattern[];
}

export interface SeasonalityPattern {
  period: string;
  factor: number;
  confidence: number;
}

export interface MarketingAutomation {
  campaigns: MarketingCampaign[];
  automation: MarketingAutomationRule[];
  segments: MarketingSegment[];
  analytics: MarketingAnalytics[];
  content: ContentManagement[];
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social' | 'web' | 'multi-channel';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  objective: string;
  audience: string[];
  budget: number;
  actualCost: number;
  startDate: Date;
  endDate?: Date;
  content: CampaignContent[];
  performance: CampaignPerformance;
  settings: CampaignSettings;
}

export interface CampaignContent {
  id: string;
  type: 'email' | 'landing' | 'ad' | 'social';
  name: string;
  subject?: string;
  body: string;
  assets: string[];
  personalization: PersonalizationRule[];
}

export interface PersonalizationRule {
  field: string;
  type: 'merge' | 'conditional' | 'dynamic';
  template: string;
  fallback: string;
}

export interface CampaignPerformance {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  bounced: number;
  revenue: number;
  roi: number;
}

export interface CampaignSettings {
  schedule: CampaignSchedule;
  tracking: TrackingSettings;
  suppression: SuppressionSettings;
  optimization: OptimizationSettings;
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  timezone: string;
  sendTimes: string[];
  frequency?: string;
}

export interface TrackingSettings {
  opens: boolean;
  clicks: boolean;
  conversions: boolean;
  revenue: boolean;
  customEvents: string[];
}

export interface SuppressionSettings {
  unsubscribed: boolean;
  bounced: boolean;
  complaints: boolean;
  customLists: string[];
}

export interface OptimizationSettings {
  sendTimeOptimization: boolean;
  subjectLineOptimization: boolean;
  contentOptimization: boolean;
  frequencyCapping: boolean;
}

export interface MarketingAutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: MarketingCondition[];
  actions: MarketingAction[];
  enabled: boolean;
  performance: AutomationPerformance;
}

export interface MarketingCondition {
  field: string;
  operator: string;
  value: any;
}

export interface MarketingAction {
  type: 'send' | 'wait' | 'branch' | 'add-tag' | 'remove-tag' | 'update-field';
  parameters: Record<string, any>;
}

export interface MarketingSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  customers: string[];
  size: number;
  performance: SegmentPerformance;
}

export interface SegmentPerformance {
  engagement: number;
  conversion: number;
  revenue: number;
  churn: number;
}

export interface MarketingAnalytics {
  campaigns: CampaignAnalytics[];
  channels: ChannelAnalytics[];
  content: ContentAnalytics[];
  attribution: AttributionAnalytics[];
}

export interface CampaignAnalytics {
  id: string;
  name: string;
  metrics: CampaignPerformance;
  trends: PerformanceTrend[];
  insights: string[];
}

export interface PerformanceTrend {
  date: string;
  metric: string;
  value: number;
}

export interface ChannelAnalytics {
  channel: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  cost: number;
  roi: number;
}

export interface ContentAnalytics {
  id: string;
  name: string;
  type: string;
  performance: ContentPerformance[];
  variations: ContentVariation[];
}

export interface ContentPerformance {
  metric: string;
  value: number;
  benchmark: number;
}

export interface ContentVariation {
  id: string;
  name: string;
  performance: CampaignPerformance;
  winner: boolean;
}

export interface AttributionAnalytics {
  models: AttributionModel[];
  touchpoints: TouchpointAnalytics[];
  paths: PathAnalytics[];
}

export interface AttributionModel {
  name: string;
  type: 'first-touch' | 'last-touch' | 'linear' | 'time-decay' | 'position-based';
  revenue: number;
  conversions: number;
}

export interface TouchpointAnalytics {
  touchpoint: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
}

export interface PathAnalytics {
  path: string[];
  count: number;
  conversionRate: number;
  averageLength: number;
}

export interface ContentManagement {
  templates: ContentTemplate[];
  assets: ContentAsset[];
  library: ContentLibrary[];
  approval: ContentApproval[];
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: 'email' | 'landing' | 'ad' | 'social';
  category: string;
  subject?: string;
  body: string;
  variables: TemplateVariable[];
  preview: string;
  usage: number;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'image' | 'link' | 'date' | 'number';
  required: boolean;
  default?: string;
}

export interface ContentAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  size: number;
  format: string;
  tags: string[];
  usage: number;
}

export interface ContentLibrary {
  id: string;
  name: string;
  type: 'template' | 'asset' | 'campaign';
  items: string[];
  permissions: LibraryPermission[];
}

export interface LibraryPermission {
  role: string;
  permissions: ('view' | 'edit' | 'delete' | 'share')[];
}

export interface ContentApproval {
  id: string;
  contentId: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  requester: string;
  approver?: string;
  comments: string;
  requestedAt: Date;
  reviewedAt?: Date;
}

export interface SupportManagement {
  tickets: SupportTicket[];
  knowledge: KnowledgeBase[];
  automation: SupportAutomation[];
  analytics: SupportAnalytics[];
  satisfaction: SatisfactionSurvey[];
}

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
  category: string;
  type: string;
  source: 'email' | 'phone' | 'chat' | 'web' | 'api';
  assignedTo?: string;
  group: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  resolvedAt?: Date;
  activities: TicketActivity[];
  attachments: TicketAttachment[];
  satisfaction?: number;
}

export interface TicketActivity {
  id: string;
  type: 'comment' | 'status-change' | 'assignment' | 'priority-change' | 'note';
  description: string;
  author: string;
  timestamp: Date;
  public: boolean;
  attachments: string[];
}

export interface TicketAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface KnowledgeBase {
  articles: KnowledgeArticle[];
  categories: KnowledgeCategory[];
  search: SearchAnalytics[];
  feedback: ArticleFeedback[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author: string;
  publishedAt?: Date;
  updatedAt: Date;
  views: number;
  helpful: number;
  notHelpful: number;
  related: string[];
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  parent?: string;
  order: number;
  articles: string[];
  permissions: CategoryPermission[];
}

export interface CategoryPermission {
  role: string;
  permissions: ('view' | 'edit' | 'delete' | 'publish')[];
}

export interface SearchAnalytics {
  query: string;
  count: number;
  results: number;
  clicked: string[];
  timestamp: Date;
}

export interface ArticleFeedback {
  articleId: string;
  rating: number;
  comment?: string;
  helpful: boolean;
  timestamp: Date;
}

export interface SupportAutomation {
  rules: SupportRule[];
  workflows: SupportWorkflow[];
  escalation: EscalationRule[];
  sla: SLARule[];
}

export interface SupportRule {
  id: string;
  name: string;
  trigger: string;
  conditions: SupportCondition[];
  actions: SupportAction[];
  enabled: boolean;
  performance: AutomationPerformance;
}

export interface SupportCondition {
  field: string;
  operator: string;
  value: any;
}

export interface SupportAction {
  type: 'assign' | 'priority' | 'status' | 'notify' | 'escalate' | 'respond';
  parameters: Record<string, any>;
}

export interface SupportWorkflow {
  id: string;
  name: string;
  trigger: string;
  steps: WorkflowStep[];
  enabled: boolean;
  performance: WorkflowPerformance;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'manual' | 'automated';
  conditions: SupportCondition[];
  actions: SupportAction[];
  timeout?: number;
}

export interface WorkflowPerformance {
  executions: number;
  completionRate: number;
  averageTime: number;
  errors: number;
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: SupportCondition[];
  actions: SupportAction[];
  enabled: boolean;
  history: EscalationHistory[];
}

export interface EscalationHistory {
  ticketId: string;
  escalatedAt: Date;
  escalatedBy: string;
  reason: string;
}

export interface SLARule {
  id: string;
  name: string;
  conditions: SLACondition[];
  targets: SLATarget[];
  enabled: boolean;
}

export interface SLACondition {
  field: string;
  operator: string;
  value: any;
}

export interface SLATarget {
  metric: 'response-time' | 'resolution-time' | 'first-response';
  target: number;
  unit: 'minutes' | 'hours' | 'days';
  businessHours: boolean;
}

export interface SupportAnalytics {
  tickets: TicketAnalytics[];
  agents: AgentAnalytics[];
  performance: PerformanceMetrics[];
  trends: TrendAnalytics[];
}

export interface TicketAnalytics {
  period: string;
  created: number;
  resolved: number;
  open: number;
  backlog: number;
  responseTime: number;
  resolutionTime: number;
  satisfaction: number;
}

export interface AgentAnalytics {
  agent: string;
  tickets: number;
  resolved: number;
  responseTime: number;
  resolutionTime: number;
  satisfaction: number;
  utilization: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  resolutionTime: number;
  firstContactResolution: number;
  customerSatisfaction: number;
  ticketVolume: number;
  agentUtilization: number;
}

export interface TrendAnalytics {
  metric: string;
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SatisfactionSurvey {
  id: string;
  ticketId: string;
  type: 'csat' | 'nps' | 'ces';
  score: number;
  feedback?: string;
  sentAt: Date;
  respondedAt?: Date;
  channel: string;
}
