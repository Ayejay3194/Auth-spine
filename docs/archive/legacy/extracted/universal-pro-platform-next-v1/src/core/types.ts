export type ID = string;
export type ISODateTime = string;

export type PlatformChannel =
  | "in_app_chat" | "sms" | "email" | "instagram_dm" | "web" | "ios" | "android";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ModuleMeta { id: string; name: string; version: string; requires?: string[]; provides?: string[]; }

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

export interface Module { meta: ModuleMeta; init(ctx: ModuleContext): Promise<void> | void; dispose?(): Promise<void> | void; }

export interface Logger { debug(msg: string, data?: unknown): void; info(msg: string, data?: unknown): void; warn(msg: string, data?: unknown): void; error(msg: string, data?: unknown): void; }

export interface FeatureFlags { enabled(key: string, subject?: { userId?: ID; professionalId?: ID }): boolean; }

export interface Event<TType extends string = string, TPayload = unknown> {
  id: ID; type: TType; at: ISODateTime;
  actor?: { userId?: ID; professionalId?: ID };
  subject?: { userId?: ID; professionalId?: ID; bookingId?: ID; reviewId?: ID };
  channel?: PlatformChannel;
  payload: TPayload;
}

export interface EventBus {
  publish<E extends Event>(event: E): Promise<void>;
  subscribe<TType extends string>(type: TType, handler: (event: Event<TType, any>) => Promise<void> | void): () => void;
}

export interface KVStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, opts?: { ttlSeconds?: number }): Promise<void>;
  del(key: string): Promise<void>;
  scan(prefix: string, limit?: number): Promise<string[]>;
}

export type ConsentType = "calendar_read" | "photo_use_public" | "photo_use_marketing" | "message_analysis" | "competitive_monitoring";

export interface PrivacyPolicy { hasConsent(subject: { userId?: ID; professionalId?: ID }, consent: ConsentType): boolean; }

export interface ScoreResult { key: string; value: number; level?: RiskLevel; signals?: Record<string, number>; }

export interface ScoringService { score(key: string, input: unknown): Promise<ScoreResult>; }

export interface WorkflowState {
  id: ID; type: string; owner: { userId?: ID; professionalId?: ID };
  status: "active" | "paused" | "completed" | "failed";
  step: string; data: Record<string, unknown>; updatedAt: ISODateTime;
}

export interface WorkflowService { upsert(state: WorkflowState): Promise<void>; get(workflowId: ID): Promise<WorkflowState | null>; resume(workflowId: ID): Promise<void>; }
