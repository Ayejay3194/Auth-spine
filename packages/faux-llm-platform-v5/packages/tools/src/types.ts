export interface ToolCall {
  tool: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

export type ToolFn = (args: Record<string, unknown>) => Promise<ToolResult>;
