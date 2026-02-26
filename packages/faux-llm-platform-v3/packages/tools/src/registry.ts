import type { ToolFn, ToolResult } from "./types";

export class ToolRegistry {
  private map = new Map<string, ToolFn>();

  register(name: string, fn: ToolFn): void {
    this.map.set(name, fn);
  }

  has(name: string): boolean { return this.map.has(name); }

  async run(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const fn = this.map.get(name);
    if (!fn) return { ok: false, error: "tool_not_found" };
    try {
      return await fn(args);
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "tool_error" };
    }
  }
}
