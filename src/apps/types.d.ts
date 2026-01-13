export type ISODateTime = string;
export type Role = "owner" | "staff" | "assistant" | "accountant" | "admin" | "moderator" | "client" | "manager";
export type Channel = "cmdk" | "chat" | "api" | "web" | "mobile";
export type AssistantContext = {
    actor: {
        userId: string;
        role: Role;
    };
    tenantId: string;
    nowISO: ISODateTime;
    locale?: string;
    timezone?: string;
    channel?: Channel;
};
export type Confirmation = {
    required: boolean;
    message?: string;
    token?: string;
};
export type ToolResult<T = unknown> = {
    ok: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
};
export type AuditEvent = {
    id: string;
    tsISO: ISODateTime;
    tenantId: string;
    actorUserId: string;
    actorRole: Role;
    action: string;
    target?: {
        type: string;
        id?: string;
        label?: string;
    };
    inputSummary?: Record<string, unknown>;
    outcome: "success" | "failure" | "blocked";
    reason?: string;
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
    spine: string;
    name: string;
    confidence: number;
    match: string;
};
export type Extraction = {
    entities: Record<string, unknown>;
    missing: string[];
};
export type FlowStep = {
    kind: "ask";
    prompt: string;
    missing: string[];
} | {
    kind: "confirm";
    prompt: string;
    token: string;
} | {
    kind: "execute";
    action: string;
    sensitivity: "low" | "medium" | "high";
    tool: string;
    input: Record<string, unknown>;
} | {
    kind: "respond";
    message: string;
    payload?: unknown;
};
export type FlowRunResult = {
    steps: FlowStep[];
    final?: {
        ok: boolean;
        message: string;
        payload?: unknown;
    };
};
export type Spine = {
    name: string;
    description: string;
    version: string;
    detectIntent: (text: string, ctx: AssistantContext) => Intent[];
    extractEntities: (intent: Intent, text: string, ctx: AssistantContext) => Extraction;
    buildFlow: (intent: Intent, extraction: Extraction, ctx: AssistantContext) => FlowStep[];
};
export type ToolRegistry = {
    [toolName: string]: (args: {
        ctx: AssistantContext;
        input: Record<string, unknown>;
    }) => Promise<ToolResult>;
};
export type ModuleConfig = {
    name: string;
    enabled: boolean;
    settings?: Record<string, unknown>;
};
export type BusinessSpineConfig = {
    tenantId: string;
    modules: ModuleConfig[];
    assistant: {
        enabled: boolean;
        engines: string[];
    };
    api: {
        port: number;
        corsOrigins: string[];
        rateLimit: {
            windowMs: number;
            max: number;
        };
    };
    logging: {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
    };
};
export type Plugin = {
    name: string;
    version: string;
    description: string;
    dependencies?: string[];
    install: (spine: any) => Promise<void>;
    uninstall?: (spine: any) => Promise<void>;
};
export type SmartEngine = {
    name: string;
    version: string;
    run: (ctx: AssistantContext) => Promise<SmartSuggestion[]>;
};
export type SmartSuggestion = {
    id: string;
    engine: string;
    title: string;
    message: string;
    severity: "info" | "warn" | "critical";
    createdAt: ISODateTime;
    why: string[];
    actions?: Array<{
        label: string;
        intent: string;
        payload?: Record<string, unknown>;
    }>;
    practitionerId?: string;
    clientId?: string;
    bookingId?: string;
};
//# sourceMappingURL=types.d.ts.map