export type ISODateTime = string;

export type Role = "owner" | "staff" | "assistant" | "accountant" | "admin" | "moderator";

export type AssistantContext = {
  actor: {
    userId: string;
    role: Role;
  };
  tenantId: string;
  nowISO: ISODateTime;
  locale?: string;
  timezone?: string;
  channel?: "cmdk" | "chat" | "api";
};

export type Confirmation = {
  required: boolean;
  message?: string;
  token?: string; // used to bind confirmation to an action payload
};

export type ToolResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
};

export type AuditEvent = {
  id: string;
  tsISO: ISODateTime;
  tenantId: string;
  actorUserId: string;
  actorRole: Role;
  action: string; // e.g., "booking.create"
  target?: { type: string; id?: string; label?: string };
  inputSummary?: Record<string, unknown>;
  outcome: "success" | "failure" | "blocked";
  reason?: string;
  // Optional: hash chaining for tamper-evidence
  prevHash?: string;
  hash?: string;
};

export type PolicyDecision = {
  allow: boolean;
  reason?: string;
  requireConfirmation?: Confirmation;
};

export type Policy = (args: {
  ctx: AssistantContext;
  action: string;
  sensitivity: "low" | "medium" | "high";
  input: Record<string, unknown>;
}) => PolicyDecision;

export type AuditWriter = (evt: AuditEvent) => Promise<void>;

export type Intent = {
  spine: string;      // "booking", "crm", ...
  name: string;       // "book", "refund", ...
  confidence: number; // 0..1
  match: string;      // debug: matched pattern
};

export type Extraction = {
  entities: Record<string, unknown>;
  missing: string[];
};

export type FlowStep =
  | { kind: "ask"; prompt: string; missing: string[] }
  | { kind: "confirm"; prompt: string; token: string }
  | { kind: "execute"; action: string; sensitivity: "low"|"medium"|"high"; tool: string; input: Record<string, unknown> }
  | { kind: "respond"; message: string; payload?: unknown };

export type FlowRunResult = {
  steps: FlowStep[];
  final?: { ok: boolean; message: string; payload?: unknown };
};

export type Spine = {
  name: string;
  description: string;
  detectIntent: (text: string, ctx: AssistantContext) => Intent[];
  extractEntities: (intent: Intent, text: string, ctx: AssistantContext) => Extraction;
  buildFlow: (intent: Intent, extraction: Extraction, ctx: AssistantContext) => FlowStep[];
};

export type ToolRegistry = {
  // map tool name -> function
  [toolName: string]: (args: { ctx: AssistantContext; input: Record<string, unknown> }) => Promise<ToolResult>;
};
