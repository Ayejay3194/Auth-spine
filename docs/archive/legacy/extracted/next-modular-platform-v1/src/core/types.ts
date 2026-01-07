export type ID = string;

export type ISODateTime = string; // store as ISO 8601

export type PlatformChannel =
  | "in_app_chat"
  | "sms"
  | "email"
  | "instagram_dm"
  | "web"
  | "ios"
  | "android";

export type CurrencyCode = "USD" | "CAD" | "GBP" | "EUR" | string;

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface TimeRange {
  start: ISODateTime;
  end: ISODateTime;
}

export interface ModuleMeta {
  id: string;
  name: string;
  version: string;
  requires?: string[];
  provides?: string[];
}

export interface ModuleContext {
  now(): ISODateTime;
  flags: FeatureFlags;
  events: EventBus;
  store: KVStore;
  scorer: ScoringService;
  workflow: WorkflowService;
  privacy: PrivacyPolicy;
  logger: Logger;
}

export interface Module {
  meta: ModuleMeta;
  init(ctx: ModuleContext): Promise<void> | void;
  dispose?(): Promise<void> | void;
}

export interface Logger {
  debug(msg: string, data?: unknown): void;
  info(msg: string, data?: unknown): void;
  warn(msg: string, data?: unknown): void;
  error(msg: string, data?: unknown): void;
}

export interface FeatureFlags {
  enabled(key: string, subject?: { userId?: ID; artistId?: ID }): boolean;
}

export interface Event<TType extends string = string, TPayload = unknown> {
  id: ID;
  type: TType;
  at: ISODateTime;
  actor?: { userId?: ID; artistId?: ID };
  subject?: { userId?: ID; artistId?: ID; bookingId?: ID; reviewId?: ID };
  channel?: PlatformChannel;
  payload: TPayload;
}

export interface EventBus {
  publish<E extends Event>(event: E): Promise<void>;
  subscribe<TType extends string>(
    type: TType,
    handler: (event: Event<TType, any>) => Promise<void> | void
  ): () => void;
}

export interface KVStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, opts?: { ttlSeconds?: number }): Promise<void>;
  del(key: string): Promise<void>;
  scan(prefix: string, limit?: number): Promise<string[]>;
}

export interface PrivacyPolicy {
  hasConsent(subject: { userId?: ID; artistId?: ID }, consent: ConsentType): boolean;
}

export type ConsentType =
  | "calendar_read"
  | "photo_use_public"
  | "photo_use_marketing"
  | "message_analysis"
  | "competitive_monitoring";

export interface ScoringService {
  score(key: string, input: unknown): Promise<ScoreResult>;
  explain?(key: string, input: unknown): Promise<ScoreExplanation>;
}

export interface ScoreResult {
  key: string;
  value: number; // 0..1
  level?: RiskLevel;
  signals?: Record<string, number>;
}

export interface ScoreExplanation {
  key: string;
  value: number;
  topSignals: Array<{ name: string; weight: number; contribution: number }>;
  notes?: string[];
}

export interface WorkflowService {
  upsert(state: WorkflowState): Promise<void>;
  get(workflowId: ID): Promise<WorkflowState | null>;
  resume(workflowId: ID): Promise<void>;
}

export interface WorkflowState {
  id: ID;
  type: string;
  owner: { userId?: ID; artistId?: ID };
  status: "active" | "paused" | "completed" | "failed";
  step: string;
  data: Record<string, unknown>;
  updatedAt: ISODateTime;
}
